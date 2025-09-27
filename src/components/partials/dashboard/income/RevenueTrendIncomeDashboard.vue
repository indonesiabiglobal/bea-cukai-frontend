<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'

// ===== Props =====
export type RevenueTrend = { date: string; debit: string | number; credit: string | number; net: string | number }
const props = defineProps<{ revenueTrend: RevenueTrend[]; isFetching: boolean }>()

// ===== Mode: tampilkan salah satu metric (dengan AVG) atau semua (tanpa AVG) =====
// all = tampilkan 3 seri sekaligus tanpa average
const mode = ref<'all' | 'net' | 'debit' | 'credit'>('all')

// Theme helper (fallback default kalau nggak ada)
const themeColors = (typeof useThemeColors === 'function') ? useThemeColors() : {
  primary: '#2563eb', // blue-600
  danger: '#ef4444',  // red-500 (dipakai untuk average)
  success: '#059669', // emerald-600
}

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

// x-axis categories
const categories = computed(() => (props.revenueTrend ?? []).map(r => dayjs(r.date).format('DD MMM')))

// points per metric
const debitVals  = computed(() => (props.revenueTrend ?? []).map(r => toNum(r.debit)))
const creditVals = computed(() => (props.revenueTrend ?? []).map(r => toNum(r.credit)))
const netVals    = computed(() => (props.revenueTrend ?? []).map(r => toNum(r.net)))

function avgOf(arr: number[]) {
  if (!arr.length) return 0
  const s = arr.reduce((a, b) => a + b, 0)
  return Math.round(s / arr.length)
}

// Combine values sesuai mode untuk hitung skala Y yang dinamis
const valuesForScale = computed(() => {
  const m = mode.value
  if (m === 'debit') return debitVals.value
  if (m === 'credit') return creditVals.value
  if (m === 'net') return netVals.value
  // mode 'all' → gabungkan semua untuk skala yang muat 3 seri
  return [...debitVals.value, ...creditVals.value, ...netVals.value]
})

// Nice bounds helper → NEW REFERENCE setiap kali hitung (agar Apex re-render)
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

// Formatter rupiah
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

// ====== Series & Options sebagai COMPUTED (IDENTITAS BARU) ======
// - Mode 'all': tampilkan 3 seri (Net, Debit, Credit) TANPA average
// - Mode single (net/debit/credit): tampilkan seri metric + seri Average (garis flat)

const chartSeries = computed(() => {
  if (!props.revenueTrend?.length) return []

  if (mode.value === 'all') {
    return [
      { name: 'Net (Δ AR)', data: netVals.value },
      { name: 'Debit (Gross)', data: debitVals.value },
      { name: 'Credit (Collections)', data: creditVals.value },
    ]
  }

  const maps: Record<'net' | 'debit' | 'credit', { name: string; data: number[] }> = {
    net:    { name: 'Net (Δ AR)', data: netVals.value },
    debit:  { name: 'Debit (Gross)', data: debitVals.value },
    credit: { name: 'Credit (Collections)', data: creditVals.value },
  }
  const sel = maps[mode.value]
  const mean = avgOf(sel.data)
  const meanSeries = Array(sel.data.length).fill(mean)

  return [ sel, { name: 'Average', data: meanSeries } ]
})

const chartOptions = computed(() => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  title: { text: 'Revenue Trend', align: 'center' },
  colors: mode.value === 'all'
    ? [themeColors.primary, themeColors.success, themeColors.danger]
    : [themeColors.primary, themeColors.danger], // metric + avg
  stroke: mode.value === 'all'
    ? { width: 3, curve: 'straight' }
    : { width: [4, 2], curve: 'straight', dashArray: [0, 6] }, // avg dashed & thinner
  markers: { size: 3, hover: { sizeOffset: 2 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: categories.value,
    labels: { style: { fontSize: '12px', colors: '#6B7280' } },
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
  <!-- ===== Revenue Trend ===== -->
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <!-- Header + Mode Switcher -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Revenue Trend</h3>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button class="px-3 py-1 text-xs" :class="mode==='all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='all'">All</button>
          <button class="px-3 py-1 text-xs" :class="mode==='net' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='net'">Net</button>
          <button class="px-3 py-1 text-xs" :class="mode==='debit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='debit'">Debit</button>
          <button class="px-3 py-1 text-xs" :class="mode==='credit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'" @click="mode='credit'">Credit</button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="h-[280px] w-full animate-pulse bg-gray-100 rounded" />

      <!-- Empty state -->
      <div v-else-if="!revenueTrend || revenueTrend.length === 0" class="h-[280px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data for selected period
      </div>

      <!-- Chart -->
      <div v-else>
        <ApexChart :key="chartKey" :height="280" type="line" :series="chartSeries" :options="chartOptions" />
      </div>
    </div>
  </div>
  <!-- ===== /Revenue Trend ===== -->
</template>
