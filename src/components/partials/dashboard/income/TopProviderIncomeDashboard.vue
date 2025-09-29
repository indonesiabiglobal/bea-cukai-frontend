<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ items: TopProviderIncome[]; isFetching: boolean; limit?: number }>(), {
  limit: 10,
})

// Theme helper
const themeColors = useThemeColors()

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

// ===== Metric selector (Net default) =====
const metric = ref<'net' | 'debit' | 'credit'>('net')
const metricLabel = computed(() => ({ net: 'Net (Δ AR)', debit: 'Debit (Gross)', credit: 'Credit (Collections)' }[metric.value]))

// ===== Data normalization & sorting =====
function initials(s: string) {
  if (!s) return '-'
  const parts = s.trim().split(/\s+/)
  const pick = (w: string) => w.charAt(0).toUpperCase()
  if (parts.length === 1) return pick(parts[0])
  return (pick(parts[0]) + pick(parts[parts.length - 1])).slice(0, 2)
}

const normalized = computed(() => (props.items ?? []).map((x) => ({
  code: x.code || '-',
  name: x.name || x.code || '-',
  avatar: initials(x.name || x.code || ''),
  debit: toNum(x.debit),
  credit: toNum(x.credit),
  net: toNum(x.net),
})))

const sorted = computed(() => {
  const m = metric.value
  return [...normalized.value].sort((a, b) => toNum(b[m]) - toNum(a[m]))
})

const topN = computed(() => sorted.value.slice(0, props.limit))

// ===== Apex series & options (computed → referensi baru agar re-render) =====
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

const barCategories = computed(() => topN.value.map((r) => (r.name || r.code || '-')))
const barValues = computed(() => topN.value.map((r) => toNum(r[metric.value])))

const series = computed(() => [{ name: metricLabel.value, data: barValues.value }])

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

const yBounds = computed(() => computeBounds(barValues.value))
const options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  title: { text: 'Top Providers', align: 'center' },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '60%',
      dataLabels: { position: 'center' }, // tetap center
    },
  },
  colors: [themeColors.success],
  dataLabels: {
    enabled: true,
    formatter: (val: number) => cf.format(val),
    style: {
      fontSize: '11px',
      fontWeight: 700,
      colors: ['#ffffff'],
    },
    background: {
      enabled: true,
      foreColor: themeColors.success,
      padding: 3,
      borderRadius: 4,
      borderWidth: 0,
      opacity: 0.9,            // sedikit tembus pandang
      // dropShadow opsional jika mau lebih pop-out
      dropShadow: { enabled: false }
    },
    offsetX: 0,
  },
  xaxis: {
    categories: barCategories.value,
    labels: { formatter: (val: number) => cf.format(Number(val)), style: { colors: themeColors.grey } },
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
  tooltip: { y: { formatter: (val: number) => cf.format(val) } },
  legend: { show: false },
}))

</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-lg shadow p-3">
      <!-- Header + Metric switcher -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Top Providers</h3>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button class="px-3 py-1 text-xs"
            :class="metric === 'net' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="metric = 'net'">Net</button>
          <button class="px-3 py-1 text-xs"
            :class="metric === 'debit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="metric = 'debit'">Debit</button>
          <button class="px-3 py-1 text-xs"
            :class="metric === 'credit' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'"
            @click="metric = 'credit'">Credit</button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="h-[320px] w-full animate-pulse bg-gray-100 rounded" />

      <!-- Empty state -->
      <div v-else-if="!items || items.length === 0"
        class="h-[320px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data for selected period
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Chart -->
        <div class="col-span-1">
          <ApexChart :height="320" type="bar" :series="series" :options="options" />
        </div>

        <!-- Table -->
        <div class="col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Provider</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Debit</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Credit</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Net</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in topN" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        :style="{ backgroundColor: themeColors.primary }">
                        {{ r.avatar }}
                      </div>
                      <div class="min-w-0">
                        <div class="font-medium text-gray-900 truncate max-w-[100px]" :title="r.name">{{ r.name ||
                          r.code }}</div>
                        <div class="text-[11px] text-gray-500">{{ r.code || '-' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(r.debit) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(r.credit) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50" :class="r.net >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{
                    cf.format(r.net) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
