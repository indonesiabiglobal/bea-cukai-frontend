<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ items: VisitByDayOfWeek[]; isFetching: boolean }>()

// theme fallback (pakai useThemeColors() punyamu kalau ada)
const themeColors = useThemeColors()

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}
const nf = new Intl.NumberFormat('id-ID')

// Urutkan Sun(0) → Sat(6) dan normalisasi
const rows = computed(() => {
  const ordered = Array.from({ length: 7 }, (_, i) => i)
  const map = new Map<number, { label: string; visits: number }>()
  for (const r of (props.items ?? [])) {
    const k = toNum((r as any).dow)
    map.set(k, { label: (r as any).label || ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][k] || 'NA', visits: toNum((r as any).visits) })
  }
  return ordered.map(d => map.get(d) ?? { label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d], visits: 0 })
})

const categories = computed(() => rows.value.map(r => r.label))
const data = computed(() => rows.value.map(r => r.visits))

// Ringkasan
const total = computed(() => data.value.reduce((s, v) => s + v, 0))
const maxVal = computed(() => Math.max(...data.value))
const peakIdx = computed(() => data.value.findIndex(v => v === maxVal.value))
const peakLabel = computed(() => categories.value[peakIdx.value] ?? '-')

// Hitung batas Y yang rapi
function niceMax(n: number) {
  if (n <= 5) return 5
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)))
  const base = Math.ceil(n / pow10)
  const niceBase = base <= 2 ? 2 : base <= 5 ? 5 : 10
  return niceBase * pow10
}
const yMax = computed(() => niceMax(Math.max(0, ...data.value)))

// Series & Options
const series = computed(() => [{ name: 'Visits', data: data.value }])

const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, zoom: { enabled: false } },
  title: { text: 'Visits by Day of Week', align: 'center' },
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
    style: { fontSize: '11px', colors: ['#ffffff'] },
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
    labels: { formatter: (val: number) => nf.format(Math.round(val)), style: { colors: themeColors.grey } },
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
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Visits by DOW</h3>
        <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>
      </div>

      <!-- Summary badges -->
      <div v-if="!isFetching" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div class="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div class="text-[11px] font-medium text-blue-700">Total</div>
          <div class="text-lg font-bold text-blue-900">{{ nf.format(total) }}</div>
        </div>
        <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <div class="text-[11px] font-medium text-emerald-700">Busiest Day</div>
          <div class="text-lg font-bold text-emerald-900">{{ peakLabel }}</div>
        </div>
        <div class="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div class="text-[11px] font-medium text-amber-700">Max / day</div>
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
