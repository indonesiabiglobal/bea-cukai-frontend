<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ items: VisitTrendPoint[]; isFetching: boolean }>()

// (opsional) kalau kamu punya helper theme
const themeColors = (window as any)?.useThemeColors?.() ?? {
  primary: '#3B82F6',   // blue-500
  success: '#10B981',   // emerald-500
  warning: '#F59E0B',   // amber-500
  purple: '#8B5CF6',    // violet-500
  grey: '#6B7280',      // gray-500
}

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const dtf = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' })
const nf = new Intl.NumberFormat('id-ID')

// Normalisasi data
const points = computed(() =>
  (props.items ?? []).map(p => ({
    x: new Date(p.date),
    visits: toNum(p.visits),
    inpatient: toNum(p.inpatient),
    outpatient: toNum(p.outpatient),
    admits: toNum(p.admits),
  }))
)

// Kategori X (format d MMM)
const categories = computed(() => points.value.map(p => dtf.format(p.x)))

// Series
const series = computed(() => [
  { name: 'Total Visits',   data: points.value.map(p => p.visits) },
  { name: 'Inpatient (IP)', data: points.value.map(p => p.inpatient) },
  { name: 'Outpatient (OP)',data: points.value.map(p => p.outpatient) },
  { name: 'Admits',         data: points.value.map(p => p.admits) },
])

// Hitung batas Y yang rapi
function niceMax(n: number) {
  if (n <= 5) return 5
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)))
  const base = Math.ceil(n / pow10)
  const niceBase = base <= 2 ? 2 : base <= 5 ? 5 : 10
  return niceBase * pow10
}

const yMax = computed(() => {
  const maxVal = Math.max(
    0,
    ...series.value.flatMap(s => s.data as number[])
  )
  return niceMax(maxVal)
})

// Opsi chart
const options = computed(() => ({
  chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
  title: { text: 'Visits Trend', align: 'center' },
  colors: [themeColors.primary, themeColors.success, themeColors.warning, themeColors.purple],
  stroke: { width: 3, curve: 'smooth' },
  markers: { size: 3, hover: { sizeOffset: 2 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: categories.value,
    labels: { style: { colors: themeColors.grey, fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: yMax.value,
    tickAmount: 4,
    labels: { formatter: (val: number) => nf.format(Math.round(val)), style: { colors: themeColors.grey } },
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  legend: { position: 'top', horizontalAlign: 'center' },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => nf.format(val) },
  },
}))
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Visits Trend</h3>
        <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="h-[320px] w-full rounded-xl bg-gray-100 animate-pulse" />

      <!-- Empty -->
      <div v-else-if="!items || items.length === 0" class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>

      <!-- Chart -->
      <div v-else class="w-full">
        <ApexChart :height="320" type="line" :series="series" :options="options" />
      </div>
    </div>
  </div>
</template>
