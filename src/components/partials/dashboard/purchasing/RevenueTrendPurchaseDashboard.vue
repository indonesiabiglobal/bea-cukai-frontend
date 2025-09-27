<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ items: PurchaseRevenueTrend[]; isFetching: boolean }>()

const mode = ref<'all' | 'qty' | 'subtotal'>('all')

// Helpers
const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')

function fmtDate(d: string | Date) {
  const dt = (typeof d === 'string') ? new Date(d) : d
  // 02 Jul
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

const rows = computed(() => (props.items ?? []).map(p => ({
  date: p.date,
  qty: toNum(p.qty),
  subtotal: toNum(p.subtotal),
})))

const categories = computed(() => rows.value.map(r => fmtDate(r.date as any)))
const qtyVals = computed(() => rows.value.map(r => r.qty))
const subtotalVals = computed(() => rows.value.map(r => r.subtotal))

function avgOf(arr: number[]) {
  if (!arr.length) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

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

// Y bounds per axis/metric
const qtyBounds = computed(() => computeBounds(qtyVals.value))
const subtotalBounds = computed(() => computeBounds(subtotalVals.value))
const activeBounds = computed(() => mode.value === 'qty' ? qtyBounds.value : subtotalBounds.value)

// Theme colors (fallback kalau tidak ada useThemeColors di project)
const themeColors = (typeof (globalThis as any).useThemeColors === 'function')
  ? (globalThis as any).useThemeColors()
  : { primary: '#2563eb', success: '#059669', danger: '#ef4444', grey: '#6B7280' }

// Series
const series = computed(() => {
  if (mode.value === 'all') {
    return [
      { name: 'Qty', data: qtyVals.value },
      { name: 'Subtotal', data: subtotalVals.value },
    ]
  }
  if (mode.value === 'qty') {
    const avg = avgOf(qtyVals.value)
    return [
      { name: 'Qty', data: qtyVals.value },
      { name: 'Average', data: Array(qtyVals.value.length).fill(avg) },
    ]
  }
  const avg = avgOf(subtotalVals.value)
  return [
    { name: 'Subtotal', data: subtotalVals.value },
    { name: 'Average', data: Array(subtotalVals.value.length).fill(avg) },
  ]
})

// Options
const options = computed(() => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  title: { text: 'Purchase Trend', align: 'center' },
  colors: mode.value === 'all' ? [themeColors.success, themeColors.primary] : [themeColors.primary, themeColors.danger],
  stroke: mode.value === 'all'
    ? { width: [3, 3], curve: 'straight' }
    : { width: [4, 2], curve: 'straight', dashArray: [0, 6] },
  markers: { size: 3, hover: { sizeOffset: 2 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: categories.value,
    labels: { style: { fontSize: '12px', colors: '#6B7280' } },
    axisBorder: { show: false }, axisTicks: { show: false },
  },
  yaxis: mode.value === 'all' ? [
    {
      seriesName: 'Qty',
      title: { text: 'Qty' },
      labels: { formatter: (v: number) => nf.format(v), style: { colors: themeColors.grey } },
      min: 0, max: qtyBounds.value.max, tickAmount: qtyBounds.value.ticks,
    },
    {
      seriesName: 'Subtotal',
      opposite: true,
      title: { text: 'Subtotal (IDR)' },
      labels: { formatter: (v: number) => cf.format(v), style: { colors: themeColors.grey } },
      min: 0, max: subtotalBounds.value.max, tickAmount: subtotalBounds.value.ticks,
    },
  ] : {
    labels: {
      formatter: (v: number) => mode.value === 'qty' ? nf.format(v) : cf.format(v),
      style: { colors: themeColors.grey }
    },
    min: 0, max: activeBounds.value.max, tickAmount: activeBounds.value.ticks,
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  legend: { show: true },
  tooltip: {
    shared: true,
    y: {
      formatter: (val: number, { seriesIndex }: any) => {
        if (mode.value === 'all') {
          return seriesIndex === 0 ? nf.format(val) : cf.format(val)
        }
        return mode.value === 'qty' ? nf.format(val) : cf.format(val)
      },
    },
  },
}))

const chartKey = computed(() => `${mode.value}-${categories.value.length}-${qtyBounds.value.min}-${qtyBounds.value.max}-${subtotalBounds.value.min}-${subtotalBounds.value.max}`)
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <h3 class="text-sm font-semibold text-gray-700">Purchase Trend</h3>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200 self-end md:self-auto">
          <button class="px-3 py-1 text-xs" :class="mode === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="mode = 'all'">All</button>
          <button class="px-3 py-1 text-xs" :class="mode === 'qty' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="mode = 'qty'">Qty</button>
          <button class="px-3 py-1 text-xs"
            :class="mode === 'subtotal' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="mode = 'subtotal'">Subtotal</button>
        </div>
      </div>

      <div v-if="isFetching" class="h-[300px] w-full animate-pulse bg-gray-100 rounded" />
      <div v-else-if="!items || items.length === 0"
        class="h-[300px] w-full flex items-center justify-center text-gray-500 text-sm">No data</div>
      <div v-else>
        <ApexChart :key="chartKey" :height="300" type="line" :series="series" :options="options" />
      </div>
    </div>
  </div>
</template>
