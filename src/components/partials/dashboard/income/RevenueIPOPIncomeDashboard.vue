<script setup lang="ts">
import { computed, ref } from 'vue'

export type MixIPOPRow = {
  ipop: string
  debit: string | number
  credit: string | number
  net: string | number
}

const props = withDefaults(defineProps<{ items: MixIPOPRow[]; isFetching: boolean }>(), {})

// Metric selector → default Credit (pembayaran) untuk komposisi
const metric = ref<'debit' | 'credit' | 'net'>('credit')
const metricLabel = computed(() => ({ debit: 'Debit (Gross)', credit: 'Credit (Collections)', net: 'Net (Δ AR)' }[metric.value]))

// Theme helper (fallback default kalau nggak ada)
const themeColors = useThemeColors()

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeIpop(raw: string) {
  const s = (raw || '').trim().toUpperCase()
  if (!s) return { key: 'UNKNOWN', name: 'Tidak Diketahui' }
  if (s === 'I' || s === 'IP') return { key: 'I', name: 'Rawat Inap (IP)' }
  if (s === 'O' || s === 'OP') return { key: 'O', name: 'Rawat Jalan (OP)' }
  // fallback generic
  return { key: s, name: s }
}

const rows = computed(() => (props.items ?? []).map(r => {
  const n = normalizeIpop(r.ipop)
  return {
    key: n.key,
    name: n.name,
    debit: toNum(r.debit),
    credit: toNum(r.credit),
    net: toNum(r.net),
  }
}))

const grouped = computed(() => {
  // aggregate by key just in case backend already grouped
  const acc: Record<string, { key: string; name: string; debit: number; credit: number; net: number }> = {}
  for (const r of rows.value) {
    if (!acc[r.key]) acc[r.key] = { key: r.key, name: r.name, debit: 0, credit: 0, net: 0 }
    acc[r.key].debit += r.debit
    acc[r.key].credit += r.credit
    acc[r.key].net += r.net
  }
  return Object.values(acc)
})

const sorted = computed(() => {
  const m = metric.value
  return [...grouped.value].sort((a, b) => toNum(b[m]) - toNum(a[m]))
})

const totalVal = computed(() => sorted.value.reduce((s, r) => s + toNum((r as any)[metric.value]), 0))

// ---------- Donut (untuk debit/credit) ----------
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const pf = new Intl.NumberFormat('id-ID', { style: 'percent', maximumFractionDigits: 1 })

const donutSeries = computed(() => sorted.value.map(r => Math.max(0, toNum((r as any)[metric.value])))) // clamp negatif → 0
const donutLabels = computed(() => sorted.value.map(r => r.name))

function colorFor(key: string) {
  if (key === 'I') return themeColors.primary
  if (key === 'O') return themeColors.success
  return themeColors.grey
}
const donutColors = computed(() => sorted.value.map(r => colorFor(r.key)))

const donutOptions = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false } },
  title: { text: 'Revenue by Inpatient and Outpatient', align: 'center' },
  labels: donutLabels.value,
  colors: donutColors.value,
  legend: { position: 'bottom', labels: { colors: '#4B5563' } },
  dataLabels: {
    enabled: true,
    formatter: (_val: number, opts: any) => {
      const percent = opts.w.globals.seriesPercent[opts.seriesIndex][0] / 100
      return pf.format(percent)
    },
    style: { fontSize: '12px', fontWeight: 700, colors: ['#fff'] },
    background: { enabled: true, foreColor: themeColors.primary, padding: 3, borderRadius: 4, opacity: 0.9 },
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
            formatter: (val: string) => cf.format(Number(val || '0')),
          },
          total: {
            show: true,
            label: metricLabel.value,
            formatter: () => cf.format(totalVal.value < 0 ? Math.abs(totalVal.value) : totalVal.value),
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: (val: number, opts: any) => {
        const percent = opts.w.globals.seriesPercent[opts.seriesIndex][0]
        return `${cf.format(val)} (${percent.toFixed(1)}%)`
      },
    },
  },
}))

// ---------- Bar (fallback untuk NET yg bisa negatif) ----------
const barCategories = computed(() => sorted.value.map(r => r.name))
const barValues = computed(() => sorted.value.map(r => r.net))

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
const barBounds = computed(() => computeBounds(barValues.value))

const barSeries = computed(() => [{ name: 'Net (Δ AR)', data: barValues.value }])

const barOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'Revenue by Inpatient and Outpatient (Net)', align: 'center' },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '60%',
      dataLabels: { position: 'center' },
      colors: {
        ranges: [
          { from: -1e15, to: -0.000001, color: '#ef4444' }, // merah utk negatif
          { from: 0, to: 1e15, color: '#059669' },           // hijau utk positif
        ],
      },
    },
  },
  colors: ['#059669'],
  dataLabels: {
    enabled: true,
    formatter: (val: number) => cf.format(val),
    style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
    background: { enabled: true, foreColor: themeColors.primary, padding: 3, borderRadius: 4, borderWidth: 0, opacity: 0.9 },
    offsetX: 0,
  },
  xaxis: {
    categories: barCategories.value,
    labels: { formatter: (val: number) => cf.format(Number(val)), style: { colors: '#6B7280' } },
    axisBorder: { show: false }, axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#6B7280' } },
    min: barBounds.value.min,
    max: barBounds.value.max,
    tickAmount: barBounds.value.ticks,
  },
  grid: { borderColor: '#E5E7EB', strokeDashArray: 3 },
  tooltip: { y: { formatter: (val: number) => cf.format(val) } },
  legend: { show: false },
}))
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <!-- Header: metric switcher -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Revenue by Inpatient and Outpatient</h3>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button class="px-3 py-1 text-xs"
            :class="metric === 'credit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="metric = 'credit'">Credit</button>
          <button class="px-3 py-1 text-xs"
            :class="metric === 'debit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="metric = 'debit'">Debit</button>
          <button class="px-3 py-1 text-xs"
            :class="metric === 'net' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="metric = 'net'">Net</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isFetching" class="h-[320px] w-full animate-pulse bg-gray-100 rounded" />

      <!-- Empty -->
      <div v-else-if="!items || items.length === 0"
        class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data for selected period
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="col-span-1">
          <ApexChart v-if="metric !== 'net'" :height="320" type="donut" :series="donutSeries" :options="donutOptions" />
          <ApexChart v-else :height="320" type="bar" :series="barSeries" :options="barOptions" />
        </div>

        <!-- Table summary -->
        <div class="col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Kategori</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Nilai</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <span class="inline-flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full"
                        :style="{ backgroundColor: metric === 'net' ? (r.net < 0 ? '#ef4444' : '#059669') : donutColors[idx] }"></span>
                      <span class="font-medium text-gray-900">{{ r.name }}</span>
                    </span>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format((r as any)[metric]) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">
                    <template v-if="metric !== 'net'">
                      {{ totalVal > 0
                        ? (((Number((r as any)[metric])) / totalVal) * 100).toFixed(1)
                      : '0.0'
                      }}%

                    </template>
                    <template v-else>
                      —
                    </template>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(totalVal) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ metric !== 'net' ? '100%' : '—' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    number(v: number, digits = 1) {
      if (!Number.isFinite(v)) return '0.0'
      return v.toFixed(digits)
    },
  },
}
</script>
