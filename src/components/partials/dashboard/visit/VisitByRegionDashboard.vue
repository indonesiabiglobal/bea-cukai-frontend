<script setup lang="ts">
import { computed } from 'vue'
import * as XLSX from 'xlsx'

type RegionItem = { kota: string; visits: number | string }
const props = withDefaults(defineProps<{ items: RegionItem[]; isFetching: boolean; limit?: number }>(), {
  limit: 10,
})

const themeColors = useThemeColors()
const nf = new Intl.NumberFormat('id-ID')

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

// Normalisasi & sort desc
const rows = computed(() =>
  (props.items ?? [])
    .map(r => ({ kota: (r.kota ?? '').trim() || 'UNKNOWN', visits: toNum(r.visits) }))
    .sort((a, b) => b.visits - a.visits)
)

const topRegions = computed(() => rows.value.slice(0, props.limit))

// Chart data
const categories = computed(() => topRegions.value.map(r => r.kota))
const seriesData = computed(() => topRegions.value.map(r => r.visits))
const series = computed(() => [{ name: 'Visits', data: topRegions.value.map(r => r.visits) }])

// Sumbu nilai (x-axis) yang rapi
function niceMax(n: number) {
  if (n <= 5) return 5
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)))
  const base = Math.ceil(n / pow10)
  const niceBase = base <= 2 ? 2 : base <= 5 ? 5 : 10
  return niceBase * pow10
}
const xMax = computed(() => niceMax(Math.max(0, ...topRegions.value.map(r => r.visits))))

const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'Visits by Region', align: 'center' },
  colors: [themeColors.primary],
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '60%',
      dataLabels: { position: 'center' },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => nf.format(val),
    // sesuai request:
    style: { fontSize: '11px', colors: ['#ffffff'] },
    offsetX: 0,
    background: { enabled: false },
  },
  // NOTE: horizontal bar → nilai di xaxis, kategori di yaxis
  xaxis: {
    min: 0,
    max: xMax.value,
    tickAmount: 4,
    labels: {
      formatter: (val: number) => nf.format(Number(val)),
      style: { colors: themeColors.grey },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    categories: categories.value,
    labels: { style: { colors: themeColors.grey } },
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  tooltip: { y: { formatter: (val: number) => nf.format(val) } },
  legend: { show: false },
}))

const total = computed(() => seriesData.value.reduce((s, v) => s + v, 0))

function fileName() {
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `Visits_By_Region_${ymd}.xlsx`
}


function exportRegionsExcel() {
  const data = rows.value
  if (!data.length) return

  const totalVisits = data.reduce((s, r) => s + toNum(r.visits), 0)

  const header = ['No', 'Kota', 'Visits', 'Share %']
  const aoa: (string | number)[][] = [header]

  data.forEach((r, i) => {
    const share = totalVisits > 0 ? (toNum(r.visits) / totalVisits) : 0
    aoa.push([i + 1, r.kota, Number(r.visits), Number(share)])
  })

  // TOTAL row
  aoa.push(['', `TOTAL (${`All ${data.length}`})`, Number(totalVisits), 100])

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Lebar kolom
  ws['!cols'] = [
    { wch: 4 },   // No
    { wch: 28 },  // Kota
    { wch: 12 },  // Visits
    { wch: 12 },  // Share %
  ]

  // Auto filter
  const lastRow = aoa.length - 1
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: header.length - 1 } }) }

  // Format angka
  const fmtInt = '#,##0'
  const fmtPct = '0.0%'
  for (let r = 1; r <= lastRow; r++) {
    const vCell = XLSX.utils.encode_cell({ r, c: 2 }) // Visits
    const sCell = XLSX.utils.encode_cell({ r, c: 3 }) // Share %
    if (ws[vCell]) ws[vCell].z = fmtInt
    if (ws[sCell]) ws[sCell].z = fmtPct
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'All')
  XLSX.writeFile(wb, fileName())
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Visits by Region</h3>
        <div class="flex items-center gap-2">
          <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>

          <button
            class="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow disabled:opacity-50"
            :disabled="isFetching || !items?.length" @click="exportRegionsExcel()">
            Export
          </button>
        </div>
      </div>


      <!-- Loading skeleton -->
      <div v-if="isFetching" class="grid grid-cols-3 gap-4">
        <div class="col-span-2 h-[320px] rounded-xl bg-gray-100 animate-pulse" />
        <div class="col-span-1 h-[320px] rounded-xl bg-gray-100 animate-pulse" />
      </div>

      <!-- Empty -->
      <div v-else-if="!items || items.length === 0"
        class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>

      <!-- Chart + Table -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Chart -->
        <div class="lg:col-span-2">
          <ApexChart :height="320" type="bar" :series="series" :options="options" />
        </div>

        <!-- Table summary -->
        <div class="lg:col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Kota</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Visits</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in topRegions" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <div class="font-medium text-gray-900 truncate">{{ r.kota }}</div>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(r.visits) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ total > 0 ? (((r.visits) /
                    total) * 100).toFixed(1) : '0.0' }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total</td>
                  <td class="px-3 py-2 text-right bg-gray-50">
                    {{nf.format(topRegions.reduce((s, r) => s + r.visits, 0))}}
                  </td>
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
