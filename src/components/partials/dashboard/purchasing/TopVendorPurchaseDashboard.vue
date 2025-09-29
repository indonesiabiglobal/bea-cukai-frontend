<script setup lang="ts">
import { computed, ref } from 'vue'
import * as XLSX from 'xlsx'

const props = withDefaults(defineProps<{ items: TopVendorPurchase[]; isFetching: boolean, limit?: number }>(), {
  limit: 5,
})

// metric toggle
const metric = ref<'subtotal' | 'qty'>('subtotal')

// theme helper (fallback)
const themeColors = (typeof (globalThis as any).useThemeColors === 'function')
  ? (globalThis as any).useThemeColors()
  : { success: '#059669', grey: '#6B7280', primary: '#2563eb' }

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')

// normalize + sort desc by metric
const rows = computed(() => (props.items ?? []).map(v => ({
  code: v.code || '-',
  name: v.name || v.code || '-',
  qty: toNum(v.qty),
  average_price: toNum(v.average_price),
  subtotal: toNum(v.subtotal),
})))

const sorted = computed(() => {
  const m = metric.value
  return [...rows.value].sort((a, b) => toNum((b as any)[m]) - toNum((a as any)[m]))
})

const limitedData = computed(() => sorted.value.slice(0, props.limit))

const categories = computed(() => limitedData.value.map(r => r.name))
const seriesData = computed(() => limitedData.value.map(r => (metric.value === 'subtotal' ? r.subtotal : r.qty)))

function computeBounds(arr: number[]) {
  if (!arr.length) return { min: 0, max: 1, ticks: 4 }
  let min = Math.min(...arr)
  let max = Math.max(...arr)
  if (min === max) { min -= 1; max += 1 }
  const pad = (max - min) * 0.08
  min = Math.floor(min - pad)
  max = Math.ceil(max + pad)
  return { min, max, ticks: 4 }
}
const yBounds = computed(() => computeBounds(seriesData.value))

const series = computed(() => [{ name: metric.value === 'subtotal' ? 'Subtotal' : 'Qty', data: seriesData.value }])

const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'Top Vendors', align: 'center' },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '60%',
      dataLabels: { position: 'center' },
    },
  },
  colors: [themeColors.success],
  dataLabels: {
    enabled: true,
    formatter: (val: number) => metric.value === 'subtotal' ? cf.format(val) : nf.format(val),
    style: { fontSize: '11px', colors: ['#ffffff'] },
    background: { enabled: false },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      formatter: (val: number) => metric.value === 'subtotal' ? cf.format(Number(val)) : nf.format(Number(val)),
      style: { colors: themeColors.grey },
    },
    axisBorder: { show: false }, axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: themeColors.grey } },
    min: Math.min(0, yBounds.value.min),
    max: yBounds.value.max,
    tickAmount: yBounds.value.ticks,
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  tooltip: {
    y: { formatter: (val: number) => metric.value === 'subtotal' ? cf.format(val) : nf.format(val) },
  },
  legend: { show: false },
}))

const total = computed(() => seriesData.value.reduce((s, v) => s + v, 0))
const subTotal = computed(() => limitedData.value.reduce((s, v) => s + v.subtotal, 0))
const totalQty = computed(() => limitedData.value.reduce((s, v) => s + v.qty, 0))

// ===== Export Excel (ALL vendors) =====
function vendorsFileName() {
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `Purchase_Vendors_${ymd}.xlsx`
}

function exportVendorsExcel() {
  const data = sorted.value
  if (!data.length) return

  // Totals untuk share (berdasarkan semua baris yang diekspor)
  const totalSubtotalAll = data.reduce((s, r) => s + toNum(r.subtotal), 0)
  const totalQtyAll = data.reduce((s, r) => s + toNum(r.qty), 0)

  const header = [
    'No', 'Vendor Code', 'Vendor Name',
    'Qty', 'Average Price (IDR)', 'Subtotal (IDR)',
    'Share by Subtotal %', 'Share by Qty %'
  ]
  const aoa: (string | number)[][] = [header]

  data.forEach((r, i) => {
    const shareSub = totalSubtotalAll > 0 ? (toNum(r.subtotal) / totalSubtotalAll) : 0
    const shareQty = totalQtyAll > 0 ? (toNum(r.qty) / totalQtyAll) : 0
    aoa.push([
      i + 1,
      r.code,
      r.name,
      Number(r.qty),
      Number(r.average_price),
      Number(r.subtotal),
      Number(shareSub),
      Number(shareQty),
    ])
  })

  // Row TOTAL
  aoa.push([
    '', 'TOTAL (' + (`All ${data.length}`) + ')', '',
    Number(totalQtyAll), '', Number(totalSubtotalAll), 100, 100
  ])

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Lebar kolom
  ws['!cols'] = [
    { wch: 4 },   // No
    { wch: 14 },  // Vendor Code
    { wch: 36 },  // Vendor Name
    { wch: 12 },  // Qty
    { wch: 18 },  // Avg Price
    { wch: 18 },  // Subtotal
    { wch: 18 },  // Share by Subtotal
    { wch: 16 },  // Share by Qty
  ]

  // Auto filter
  const lastRow = aoa.length - 1
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: header.length - 1 } }) }

  // Number formats
  const fmtInt = '#,##0'
  const fmtMoney = '#,##0'   // biar tetap numeric (bisa set Currency di Excel)
  const fmtPct = '0.0%'

  for (let r = 1; r <= lastRow; r++) {
    const q = XLSX.utils.encode_cell({ r, c: 3 })
    const a = XLSX.utils.encode_cell({ r, c: 4 })
    const s = XLSX.utils.encode_cell({ r, c: 5 })
    const p1 = XLSX.utils.encode_cell({ r, c: 6 })
    const p2 = XLSX.utils.encode_cell({ r, c: 7 })
    if (ws[q]) ws[q].z = fmtInt
    if (ws[a]) ws[a].z = fmtMoney
    if (ws[s]) ws[s].z = fmtMoney
    if (ws[p1]) ws[p1].z = fmtPct
    if (ws[p2]) ws[p2].z = fmtPct
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'All')
  XLSX.writeFile(wb, vendorsFileName())
}

</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Top Vendors</h3>
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-lg overflow-hidden border border-gray-200 mr-2">
            <button class="px-3 py-1 text-xs"
              :class="metric === 'subtotal' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
              @click="metric = 'subtotal'">Subtotal</button>
            <button class="px-3 py-1 text-xs"
              :class="metric === 'qty' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
              @click="metric = 'qty'">Qty</button>
          </div>

          <button class="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
            :disabled="isFetching || !items?.length" @click="exportVendorsExcel()">
            Export
          </button>
        </div>
      </div>

      <div v-if="isFetching" class="h-[320px] w-full animate-pulse bg-gray-100 rounded" />
      <div v-else-if="!items || items.length === 0"
        class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">No data</div>

      <div v-else class="grid grid-cols-1 gap-4">
        <!-- <div class="col-span-1">
          <ApexChart :height="320" type="bar" :series="series" :options="options" />
        </div> -->
        <div class="col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Vendor</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Average Price</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Qty</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Subtotal</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in limitedData" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <div class="flex flex-col"><span class="font-medium text-gray-900">{{ r.name }}</span><span
                        class="text-xs text-gray-500">{{ r.code }}</span></div>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(r.average_price) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(r.qty) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(r.subtotal) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ total > 0 ? (((metric === 'subtotal' ? r.subtotal : r.qty) / total
                  ) * 100).toFixed(1) : '0.0' }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total (Top {{ limitedData.length }})</td>
                  <td class="px-3 py-2 text-right bg-gray-50"></td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(totalQty) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(subTotal) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
