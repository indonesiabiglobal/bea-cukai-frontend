<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ items: RevenueByServiceIncome[]; isFetching: boolean; limit?: number }>(), {
  limit: 20,
})

// ===== Mode: seperti RevenueTrend (line)
// 'all' → tampilkan 3 seri (Debit, Credit, Net) tanpa average
// single metric → tampilkan 1 seri + garis Average (flat, dashed)
const mode = ref<'all' | 'debit' | 'credit' | 'net'>('all')

// Theme helper (fallback default kalau nggak ada)
const themeColors = useThemeColors()

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

// Opsional: search & sorting
const q = ref('')
const metricForSort = computed(() => (mode.value === 'all' ? 'credit' : mode.value))

const normalized = computed(() => (props.items ?? []).map((x) => ({
  code: x.code || '-',
  name: x.name || x.code || '-',
  debit: toNum(x.debit),
  credit: toNum(x.credit),
  net: toNum(x.net),
})))

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return normalized.value
  return normalized.value.filter(r => (r.name + ' ' + r.code).toLowerCase().includes(s))
})

const sorted = computed(() => {
  const metric = metricForSort.value as 'debit' | 'credit' | 'net'
  return [...filtered.value].sort((a, b) => toNum(b[metric]) - toNum(a[metric]))
})

const topN = computed(() => sorted.value.slice(0, props.limit))

// Axis categories (pakai nama service)
const categories = computed(() => topN.value.map(r => r.name || r.code || '-'))

// Series values
const debitVals  = computed(() => topN.value.map(r => r.debit))
const creditVals = computed(() => topN.value.map(r => r.credit))
const netVals    = computed(() => topN.value.map(r => r.net))

function avgOf(arr: number[]) {
  if (!arr.length) return 0
  const s = arr.reduce((a, b) => a + b, 0)
  return Math.round(s / arr.length)
}

// Tentukan data untuk skala Y
const valuesForScale = computed(() => {
  if (mode.value === 'all') return [...debitVals.value, ...creditVals.value, ...netVals.value]
  if (mode.value === 'debit') return debitVals.value
  if (mode.value === 'credit') return creditVals.value
  return netVals.value
})

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

const yBounds = computed(() => computeBounds(valuesForScale.value))

const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

// ===== Chart series (computed → objek baru agar Apex re-render)
const chartSeries = computed(() => {
  if (!topN.value.length) return []
  if (mode.value === 'all') {
    return [
      { name: 'Debit (Gross)', data: debitVals.value },
      { name: 'Credit (Collections)', data: creditVals.value },
      { name: 'Net (Δ AR)', data: netVals.value },
    ]
  }
  const map: Record<'debit' | 'credit' | 'net', { name: string; data: number[] }> = {
    debit:  { name: 'Debit (Gross)', data: debitVals.value },
    credit: { name: 'Credit (Collections)', data: creditVals.value },
    net:    { name: 'Net (Δ AR)', data: netVals.value },
  }
  const sel = map[mode.value]
  const mean = avgOf(sel.data)
  const meanSeries = Array(sel.data.length).fill(mean)
  return [ sel, { name: 'Average', data: meanSeries } ]
})

// ===== Chart options (computed → objek baru)
const chartOptions = computed(() => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  title: { text: 'Revenue by Service (Line)', align: 'center' },
  colors: mode.value === 'all'
    ? [themeColors.primary, themeColors.success, themeColors.danger]
    : [themeColors.primary, themeColors.danger],
  stroke: mode.value === 'all'
    ? { width: 3, curve: 'straight' }
    : { width: [4, 2], curve: 'straight', dashArray: [0, 6] },
  markers: { size: 3, hover: { sizeOffset: 2 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: categories.value,
    labels: {
      rotate: -30,
      rotateAlways: true,
      trim: true,
      hideOverlappingLabels: true,
      maxHeight: 80,
      style: { fontSize: '11px', colors: '#6B7280' },
    },
    axisBorder: { show: false }, axisTicks: { show: false },
  },
  yaxis: {
    labels: { formatter: (val: number) => cf.format(val), style: { fontSize: '12px', colors: '#6B7280' } },
    min: yBounds.value.min, max: yBounds.value.max, tickAmount: yBounds.value.ticks,
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  legend: { show: true },
  tooltip: { y: { formatter: (val: number) => cf.format(val) } },
}))

const chartKey = computed(() => `${mode.value}-${categories.value.length}-${yBounds.value.min}-${yBounds.value.max}`)
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <!-- Header: switcher + search -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Revenue by Service</h3>
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
            <button class="px-3 py-1 text-xs" :class="mode==='all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='all'">All</button>
            <button class="px-3 py-1 text-xs" :class="mode==='debit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='debit'">Debit</button>
            <button class="px-3 py-1 text-xs" :class="mode==='credit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='credit'">Credit</button>
            <button class="px-3 py-1 text-xs" :class="mode==='net' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='net'">Net</button>
          </div>
          <input v-model="q" type="text" placeholder="Cari service..." class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="h-[300px] w-full animate-pulse bg-gray-100 rounded" />

      <!-- Empty state -->
      <div v-else-if="!items || items.length === 0" class="h-[300px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data for selected period
      </div>

      <!-- Chart -->
      <div v-else>
        <ApexChart :key="chartKey" :height="300" type="line" :series="chartSeries" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
