<script setup lang="ts">
import { computed } from 'vue'
import * as XLSX from 'xlsx'

const props = withDefaults(defineProps<{ items: TopServiceVisit[]; isFetching: boolean; limit?: number }>(), {
  limit: 10,
})

// theme helper (fallback kalau nggak ada)
const themeColors =useThemeColors()

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}
const nf = new Intl.NumberFormat('id-ID')

// Normalisasi + sort desc
const rows = computed(() =>
  (props.items ?? [])
    .map(r => ({ code: r.type_code ?? '', name: r.name ?? 'UNKNOWN', visits: toNum(r.visits) }))
    .sort((a, b) => b.visits - a.visits)
)

const topServices = computed(() => rows.value.slice(0, props.limit))

// Data untuk chart
const categories = computed(() =>
  topServices.value.map(r => (r.code ? `${r.name} (${r.code})` : r.name))
)
const seriesData = computed(() => topServices.value.map(r => r.visits))
const series = computed(() => [
  { name: 'Visits', data: topServices.value.map(r => r.visits) }
])

// Y-axis bounds (rapi)
function niceMax(n: number) {
  if (n <= 5) return 5
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)))
  const base = Math.ceil(n / pow10)
  const niceBase = base <= 2 ? 2 : base <= 5 ? 5 : 10
  return niceBase * pow10
}
const yBounds = computed(() => {
  const max = Math.max(0, ...topServices.value.map(r => r.visits))
  return { min: 0, max: niceMax(max), ticks: 4 }
})

const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'Top Services', align: 'center' },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '60%',
      dataLabels: { position: 'center' },
    },
  },
  colors: [themeColors.primary],
  dataLabels: {
    enabled: true,
    formatter: (val: number) => nf.format(val),
    style: { fontSize: '11px', colors: ['#ffffff'] },
    offsetX: 0,
    background: { enabled: false },
  },
  xaxis: {
    categories: categories.value,
    labels: { formatter: (val: number) => nf.format(Number(val)), style: { colors: themeColors.grey } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: themeColors.grey } },
    min: yBounds.value.min,
    max: yBounds.value.max,
    tickAmount: yBounds.value.ticks,
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  tooltip: { y: { formatter: (val: number) => nf.format(val) } },
  legend: { show: false },
}))

const total = computed(() => seriesData.value.reduce((s, v) => s + v, 0))
function fileName() {
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  return `Visits_Services_${ymd}.xlsx`
}

function exportServicesExcel() {
  const data = rows.value
  if (!data.length) return

  const totalVisits = data.reduce((s, r) => s + r.visits, 0)

  const header = ['No', 'Service Code', 'Service Name', 'Visits', 'Share %']
  const aoa: (string | number)[][] = [header]

  data.forEach((r, i) => {
    const share = totalVisits > 0 ? (r.visits / totalVisits) : 0
    aoa.push([i + 1, r.code, r.name, Number(r.visits), Number(share)])
  })

  // TOTAL row
  aoa.push(['', `TOTAL (All ${data.length})`, '', Number(totalVisits), 100])

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Lebar kolom
  ws['!cols'] = [
    { wch: 4 },   // No
    { wch: 14 },  // Service Code
    { wch: 36 },  // Service Name
    { wch: 12 },  // Visits
    { wch: 12 },  // Share %
  ]

  // Auto filter
  const lastRow = aoa.length - 1
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: header.length - 1 } }) }

  // Number formats
  const fmtInt = '#,##0'
  const fmtPct = '0.0%'

  for (let r = 1; r <= lastRow; r++) {
    const v = XLSX.utils.encode_cell({ r, c: 3 }) // Visits
    const p = XLSX.utils.encode_cell({ r, c: 4 }) // Share
    if (ws[v]) ws[v].z = fmtInt
    if (ws[p]) ws[p].z = fmtPct
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'All')
  XLSX.writeFile(wb, fileName())
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6"><div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Top Services</h3>
        <div class="flex items-center gap-2">
          <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>
          <button
            class="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
            :disabled="isFetching || !items?.length"
            @click="exportServicesExcel()">
            Export (Excel)
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="grid grid-cols-3 gap-4">
        <div class="col-span-2 h-[320px] rounded-xl bg-gray-100 animate-pulse" />
        <div class="col-span-1 h-[320px] rounded-xl bg-gray-100 animate-pulse" />
      </div>

      <!-- Empty -->
      <div v-else-if="!items || items.length === 0" class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>

      <!-- Chart + Table -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <ApexChart :height="320" type="bar" :series="series" :options="options" />
        </div>
        <div class="lg:col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Service</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Visits</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in topServices" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <div class="font-medium text-gray-900">{{ r.name }}</div>
                    <div v-if="r.code" class="text-[11px] text-gray-500">Code: {{ r.code }}</div>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(r.visits) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ total > 0 ? (((r.visits) /
                    total) * 100).toFixed(1) : '0.0' }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total (Top {{ topServices.length }})</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(total) }}</td>
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
