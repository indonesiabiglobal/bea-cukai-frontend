<script setup lang="ts">
import { computed, ref } from 'vue'
import * as XLSX from 'xlsx'

const props = withDefaults(defineProps<{ items: PurchaseByCategory[]; isFetching: boolean; limit?: number }>(), {
  limit: 20,
})

// metric toggle
const metric = ref<'subtotal' | 'qty'>('subtotal')
const metricLabel = computed(() => (metric.value === 'subtotal' ? 'Subtotal (IDR)' : 'Quantity'))

// theme helper (fallback)
const themeColors = useThemeColors()
const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')

// normalize → sort desc by metric
const rows = computed(() => (props.items ?? []).map(p => ({
  code: p.category_code || '',
  name: p.category_name || p.category_code || '-',
  qty: toNum(p.qty),
  subtotal: toNum(p.subtotal),
})))

const sorted = computed(() => {
  const m = metric.value
  return [...rows.value].sort((a, b) => toNum((b as any)[m]) - toNum((a as any)[m]))
})

const limited = computed(() => sorted.value.slice(0, props.limit))

// series / labels
const labels = computed(() => limited.value.map(r => r.name))
const series = computed(() => limited.value.map(r => (metric.value === 'subtotal' ? r.subtotal : r.qty)))
const totalVal = computed(() => series.value.reduce((s, v) => s + v, 0))

// deterministic color per category name
function colorFromIndex(index: number) {
  const palette = [
    themeColors.primary,
    themeColors.secondary,
    themeColors.success,
    themeColors.info,
    themeColors.warning,
    themeColors.amber,
    themeColors.cyan,
    themeColors.violet,
    themeColors.rose,
  ]
  return palette[index]
}
const colors = computed(() => limited.value.map((_, i) => colorFromIndex(i)))

const options = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false } },
  title: { text: 'Purchases by Category', align: 'center' },
  labels: labels.value,
  colors: colors.value,
  legend: { position: 'bottom', labels: { colors: '#374151' } },
  dataLabels: {
    enabled: true,
    formatter: (_val: number, opts: any) => {
      const percent = opts.w.globals.seriesPercent[opts.seriesIndex][0] / 100
      return new Intl.NumberFormat('id-ID', { style: 'percent', maximumFractionDigits: 1 }).format(percent)
    },
    style: { fontSize: '12px', fontWeight: 700, colors: ['#fff'] },
    background: { enabled: true, foreColor: '#111827', padding: 3, borderRadius: 4, opacity: 0.9 },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: { show: true, fontSize: '12px', color: '#6B7280' },
          value: {
            show: true,
            fontSize: '16px',
            formatter: (val: string) => metric.value === 'subtotal' ? cf.format(Number(val || '0')) : nf.format(Number(val || '0')),
          },
          total: {
            show: true,
            label: metricLabel.value,
            formatter: () => metric.value === 'subtotal' ? cf.format(totalVal.value) : nf.format(totalVal.value),
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: (val: number, opts: any) => {
        const percent = opts.w.globals.seriesPercent[opts.seriesIndex][0]
        const num = metric.value === 'subtotal' ? cf.format(val) : nf.format(val)
        return `${num} (${percent.toFixed(1)}%)`
      },
    },
  },
}))

function fileName() {
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  // sertakan metric aktif biar jelas
  return `Purchase_By_Category_${ymd}.xlsx`
}

function exportPurchaseCategoryExcel() {
  const data = sorted.value
  if (!data.length) return

  const totalSubtotal = data.reduce((s, r) => s + toNum(r.subtotal), 0)
  const totalQty = data.reduce((s, r) => s + toNum(r.qty), 0)

  const header = [
    'No', 'Category Code', 'Category Name',
    'Qty', 'Subtotal (IDR)',
    'Share by Subtotal %', 'Share by Qty %'
  ]
  const aoa: (string | number)[][] = [header]

  data.forEach((r, i) => {
    const shareSub = totalSubtotal > 0 ? (toNum(r.subtotal) / totalSubtotal) : 0
    const shareQty = totalQty > 0 ? (toNum(r.qty) / totalQty) : 0
    aoa.push([
      i + 1,
      r.code ?? '',
      r.name ?? '',
      Number(r.qty),
      Number(r.subtotal),
      Number(shareSub),
      Number(shareQty),
    ])
  })

  // TOTAL row
  aoa.push([
    '', `TOTAL (${`All ${data.length}`})`,
    '',
    Number(totalQty),
    Number(totalSubtotal),
    100,
    100
  ])

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Lebar kolom
  ws['!cols'] = [
    { wch: 4 },   // No
    { wch: 16 },  // Category Code
    { wch: 28 },  // Category Name
    { wch: 12 },  // Qty
    { wch: 18 },  // Subtotal
    { wch: 18 },  // Share by Subtotal
    { wch: 16 },  // Share by Qty
  ]

  // Auto filter
  const lastRow = aoa.length - 1
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: header.length - 1 } }) }

  // Number formats
  const fmtInt = '#,##0'
  const fmtMoney = '#,##0'   // tetap numeric; user bisa set Currency di Excel
  const fmtPct = '0.0%'

  for (let r = 1; r <= lastRow; r++) {
    const q = XLSX.utils.encode_cell({ r, c: 3 }) // Qty
    const st = XLSX.utils.encode_cell({ r, c: 4 }) // Subtotal
    const s1 = XLSX.utils.encode_cell({ r, c: 5 }) // Share Subtotal
    const s2 = XLSX.utils.encode_cell({ r, c: 6 }) // Share Qty
    if (ws[q]) ws[q].z = fmtInt
    if (ws[st]) ws[st].z = fmtMoney
    if (ws[s1]) ws[s1].z = fmtPct
    if (ws[s2]) ws[s2].z = fmtPct
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'All')
  XLSX.writeFile(wb, fileName())
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Purchases by Category</h3>
        <div class="inline-flex items-center gap-2">
          <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
            <button class="px-3 py-1 text-xs"
              :class="metric === 'subtotal' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
              @click="metric = 'subtotal'">Subtotal</button>
            <button class="px-3 py-1 text-xs"
              :class="metric === 'qty' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
              @click="metric = 'qty'">Qty</button>
          </div>

          <button
            class="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow disabled:opacity-50"
            :disabled="isFetching || !items?.length" @click="exportPurchaseCategoryExcel()">
            Export
          </button>
        </div>

      </div>

      <div v-if="isFetching" class="h-[320px] w-full animate-pulse bg-gray-100 rounded" />
      <div v-else-if="!items || items.length === 0"
        class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">No data</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="col-span-1 lg:col-span-2">
          <ApexChart :height="320" type="donut" :series="series" :options="options" />
        </div>

        <div class="col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Category</th>
                  <th class="px-3 py-2 text-right">{{ metric === 'subtotal' ? 'Subtotal' : 'Qty' }}</th>
                  <th class="px-3 py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in limited" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <span class="inline-flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors[idx] }"></span>
                      <span class="font-medium text-gray-900">{{ r.name }}</span>
                    </span>
                  </td>
                  <td class="px-3 py-2 text-right">{{ metric === 'subtotal' ? cf.format(r.subtotal) : nf.format(r.qty)
                  }}
                  </td>
                  <td class="px-3 py-2 text-right">{{ totalVal > 0 ? (((metric === 'subtotal' ? r.subtotal : r.qty) /
                    totalVal)
                    * 100).toFixed(1) : '0.0' }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total</td>
                  <td class="px-3 py-2 text-right">{{ metric === 'subtotal' ? cf.format(totalVal) : nf.format(totalVal)
                  }}
                  </td>
                  <td class="px-3 py-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
