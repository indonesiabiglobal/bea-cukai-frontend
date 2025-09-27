<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ items: VisitLOSBucketDischarge[]; isFetching: boolean }>()

const themeColors = useThemeColors()
const nf = new Intl.NumberFormat('id-ID')

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

// Urutan baku bucket
const ORDER = ['<=0.5d', '0.5-1d', '1-2d', '2-3d', '3+d'] as const

// Normalisasi → isi bucket yang hilang = 0, lalu urut sesuai ORDER
const rows = computed(() => {
  const map = new Map<string, number>()
  for (const it of (props.items ?? [])) {
    const key = (it.bucket ?? '').trim()
    map.set(key, (map.get(key) ?? 0) + toNum(it.count))
  }
  return ORDER.map(label => ({ label, count: map.get(label) ?? 0 }))
})

const categories = computed(() => rows.value.map(r => r.label))
const data = computed(() => rows.value.map(r => r.count))

// Ringkasan
const total = computed(() => data.value.reduce((s, v) => s + v, 0))
const maxVal = computed(() => Math.max(0, ...data.value))
const peakIdx = computed(() => data.value.findIndex(v => v === maxVal.value))
const peakLabel = computed(() => (peakIdx.value >= 0 ? categories.value[peakIdx.value] : '-'))

// Y-axis nice max
function niceMax(n: number) {
  if (n <= 5) return 5
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)))
  const base = Math.ceil(n / pow10)
  const niceBase = base <= 2 ? 2 : base <= 5 ? 5 : 10
  return niceBase * pow10
}
const yMax = computed(() => niceMax(maxVal.value))

// Series & options
const series = computed(() => [{ name: 'Discharges', data: data.value }])

const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'LOS Buckets (Inpatient Discharges)', align: 'center' },
  colors: [themeColors.primary],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '45%',
      borderRadius: 6,
      dataLabels: { position: 'top' }, // label di atas bar
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => nf.format(val),
    style: { fontSize: '11px', colors: ['#fff'] },
    offsetY: 10,
    background: { enabled: false },
  },
  xaxis: {
    categories: categories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: themeColors.grey } },
  },
  yaxis: {
    min: 0,
    max: yMax.value,
    tickAmount: 4,
    labels: { formatter: (v: number) => nf.format(Math.round(v)), style: { colors: themeColors.grey } },
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  tooltip: { y: { formatter: (val: number) => nf.format(val) } },
  legend: { show: false },
}))
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">LOS Buckets</h3>
        <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>
      </div>

      <!-- Summary badges -->
      <div v-if="!isFetching" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div class="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div class="text-[11px] font-medium text-blue-700">Total Discharges</div>
          <div class="text-lg font-bold text-blue-900">{{ nf.format(total) }}</div>
        </div>
        <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <div class="text-[11px] font-medium text-emerald-700">Peak Bucket</div>
          <div class="text-lg font-bold text-emerald-900">{{ peakLabel }}</div>
        </div>
        <div class="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div class="text-[11px] font-medium text-amber-700">Max / Bucket</div>
          <div class="text-lg font-bold text-amber-900">{{ nf.format(maxVal) }}</div>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="h-[320px] w-full rounded-xl bg-gray-100 animate-pulse" />

      <!-- Empty -->
      <div v-else-if="!items || items.length === 0" class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>

      <!-- Chart -->
      <div v-else>
        <ApexChart :height="320" type="bar" :series="series" :options="options" />
      </div>
    </div>
  </div>
</template>
