<script setup lang="ts">
import { computed, ref } from 'vue'
import * as XLSX from 'xlsx'

const props = withDefaults(defineProps<{ items: TopProductSale[]; isFetching: boolean; limit?: number }>(), {
  limit: 10,
})

// metric toggle
const metric = ref<'subtotal' | 'qty'>('subtotal')

// theme helper (fallback)
const themeColors = useThemeColors()

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')

// normalize + sort desc by metric
const rows = computed(() => (props.items ?? []).map(p => ({
  code: p.code || '-',
  name: p.name || p.code || '-',
  category_code: p.category_code || '',
  category_name: p.category_name || '',
  qty: toNum(p.qty),
  average_price: toNum(p.average_price),
  subtotal: toNum(p.subtotal),
})))

const sorted = computed(() => {
  const m = metric.value
  return [...rows.value].sort((a, b) => toNum((b as any)[m]) - toNum((a as any)[m]))
})

const limited = computed(() => sorted.value.slice(0, props.limit))

const categories = computed(() => limited.value.map(r => r.name))
const seriesData = computed(() => limited.value.map(r => (metric.value === 'subtotal' ? r.subtotal : r.qty)))

function computeBounds(arr: number[]) {
  if (!arr.length) return { min: 0, max: 1, ticks: 4 }
  let min = Math.min(...arr)
  let max = Math.max(...arr)
  if (min === max) { min = Math.max(0, min - 1); max = max + 1 }
  const pad = (max - min) * 0.08
  min = Math.floor(min - pad)
  max = Math.ceil(max + pad)
  return { min, max, ticks: 4 }
}
const yBounds = computed(() => computeBounds(seriesData.value))

const series = computed(() => [{ name: metric.value === 'subtotal' ? 'Subtotal' : 'Qty', data: seriesData.value }])

const barColor = computed(() => themeColors.success)

const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'Top Products', align: 'center' },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '60%',
      dataLabels: { position: 'center' },
    },
  },
  colors: [barColor.value],
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
const subTotal = computed(() => limited.value.reduce((s, v) => s + v.subtotal, 0))
const totalQty = computed(() => limited.value.reduce((s, v) => s + v.qty, 0))

function fileName() {
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `Sales_TopProducts_${ymd}.xlsx`
}

function exportSaleProductsExcel() {
  const data = sorted.value
  if (!data.length) return

  const totalSubtotal = data.reduce((s, r) => s + toNum(r.subtotal), 0)
  const totalQty = data.reduce((s, r) => s + toNum(r.qty), 0)

  const header = [
    'No', 'Code', 'Name', 'Category Code', 'Category Name',
    'Qty', 'Average Price (IDR)', 'Subtotal (IDR)',
    'Share by Subtotal %', 'Share by Qty %'
  ]
  const aoa: (string | number)[][] = [header]

  data.forEach((r, i) => {
    const shareSub = totalSubtotal > 0 ? (toNum(r.subtotal) / totalSubtotal) * 100 : 0
    const shareQty = totalQty > 0 ? (toNum(r.qty) / totalQty) * 100 : 0
    aoa.push([
      i + 1,
      r.code,
      r.name,
      r.category_code,
      r.category_name,
      Number(r.qty),
      Number(r.average_price),
      Number(r.subtotal),
      Number(shareSub),
      Number(shareQty),
    ])
  })

  // TOTAL row
  aoa.push([
    '', `TOTAL (${`All ${data.length}`})`, '', '', '',
    Number(totalQty), '', Number(totalSubtotal), 100, 100
  ])

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Lebar kolom
  ws['!cols'] = [
    { wch: 4 },   // No
    { wch: 12 },  // Code
    { wch: 40 },  // Name
    { wch: 14 },  // Category Code
    { wch: 22 },  // Category Name
    { wch: 12 },  // Qty
    { wch: 18 },  // Avg Price
    { wch: 18 },  // Subtotal
    { wch: 18 },  // Share by Subtotal
    { wch: 16 },  // Share by Qty
  ]

  // Auto filter (header → baris 0, kolom 0..9)
  const lastRow = aoa.length - 1
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: header.length - 1 } }) }

  // Number formats
  const fmtInt = '#,##0'
  const fmtMoney = '#,##0'   // biar numeric (user bisa set Currency di Excel)
  const fmtPct = '0.0%'

  for (let r = 1; r <= lastRow; r++) {
    const q = XLSX.utils.encode_cell({ r, c: 5 }) // Qty
    const ap = XLSX.utils.encode_cell({ r, c: 6 }) // Avg Price
    const st = XLSX.utils.encode_cell({ r, c: 7 }) // Subtotal
    const s1 = XLSX.utils.encode_cell({ r, c: 8 }) // Share Subtotal
    const s2 = XLSX.utils.encode_cell({ r, c: 9 }) // Share Qty
    if (ws[q]) ws[q].z = fmtInt
    if (ws[ap]) ws[ap].z = fmtMoney
    if (ws[st]) ws[st].z = fmtMoney
    if (ws[s1]) ws[s1].z = fmtPct
    if (ws[s2]) ws[s2].z = fmtPct
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws,'All')
  XLSX.writeFile(wb, fileName())
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Top Products</h3>
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
            <button class="px-3 py-1 text-xs"
              :class="metric === 'subtotal' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
              @click="metric = 'subtotal'">Subtotal</button>
            <button class="px-3 py-1 text-xs"
              :class="metric === 'qty' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
              @click="metric = 'qty'">Qty</button>
          </div>
          <!-- Export All -->
          <button class="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
            :disabled="isFetching || !items?.length" @click="exportSaleProductsExcel()">
            Export
          </button>
        </div>
      </div>

      <div v-if="isFetching" class="h-[320px] w-full animate-pulse bg-gray-100 rounded" />
      <div v-else-if="!items || items.length === 0"
        class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">No data</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="col-span-1">
          <ApexChart :height="320" type="bar" :series="series" :options="options" />
        </div>
        <div class="col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Product</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Average Price</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Qty</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Subtotal</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in limited" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <div class="flex flex-col">
                      <span class="font-medium text-gray-900">{{ r.name }}</span>
                      <div class="flex items-center gap-2 text-xs text-gray-500">
                        <span>{{ r.code }}</span>
                        <span v-if="r.category_name"
                          class="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px]"
                          :style="{ borderColor: '#e5e7eb' }">
                          {{ r.category_name }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(r.average_price) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(r.qty) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(r.subtotal) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ total > 0 ? (((metric === 'subtotal' ? r.subtotal : r.qty) /
                    total) * 100).toFixed(1) : '0.0' }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total (Top {{ limited.length }})</td>
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
