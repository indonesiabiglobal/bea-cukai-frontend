<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ items: VisitIPOP[]; isFetching: boolean }>()

const themeColors = useThemeColors()
const nf = new Intl.NumberFormat('id-ID')
const pf1 = new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeIpop(raw: string) {
  const s = (raw || '').trim().toUpperCase()
  if (!s) return { key: 'UNKNOWN', name: 'Tidak Diketahui' }
  if (s === 'I' || s === 'IP') return { key: 'I', name: 'Rawat Inap (IP)' }
  if (s === 'O' || s === 'OP') return { key: 'O', name: 'Rawat Jalan (OP)' }
  return { key: s, name: s }
}

function colorFor(key: string) {
  if (key === 'I') return themeColors.primary
  if (key === 'O') return themeColors.success
  return themeColors.grey
}

// Agregasi & sort
const rows = computed(() => {
  const acc: Record<string, { key: string; name: string; visits: number }> = {}
  for (const it of (props.items ?? [])) {
    const n = normalizeIpop(it.ipop)
    if (!acc[n.key]) acc[n.key] = { key: n.key, name: n.name, visits: 0 }
    acc[n.key].visits += toNum(it.visits)
  }
  return Object.values(acc).sort((a, b) => b.visits - a.visits)
})

// Donut data
const series = computed(() => rows.value.map(r => r.visits))
const labels = computed(() => rows.value.map(r => r.name))
const colors = computed(() => rows.value.map(r => colorFor(r.key)))
const total = computed(() => rows.value.reduce((s, r) => s + r.visits, 0))

const options = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false } },
  title: { text: 'Visits by Inpatient vs Outpatient', align: 'center' },
  labels: labels.value,
  colors: colors.value,
  legend: { position: 'bottom', labels: { colors: themeColors.grey } },
  dataLabels: {
    enabled: true,
    formatter: (_val: number, opts: any) => {
      // Apex gives percent in 0..100
      const p = (opts?.w?.globals?.seriesPercent?.[opts.seriesIndex]?.[0] ?? 0) / 100
      return pf1.format(p)
    },
    style: { fontSize: '12px', fontWeight: 700, colors: ['#fff'] },
    background: { enabled: false },
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
            formatter: (val: string) => nf.format(Number(val || '0')),
          },
          total: {
            show: true,
            label: 'Total Visits',
            formatter: () => nf.format(total.value),
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: (val: number, opts: any) => {
        const percent = opts?.w?.globals?.seriesPercent?.[opts.seriesIndex]?.[0] ?? 0
        return `${nf.format(val)} (${percent.toFixed(1)}%)`
      },
    },
  },
}))
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Visits IPOP</h3>
        <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>
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
        <!-- Donut -->
        <div class="lg:col-span-2">
          <ApexChart :height="320" type="donut" :series="series" :options="options" />
        </div>

        <!-- Table summary -->
        <div class="lg:col-span-1">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-xs font-semibold text-gray-600">
                  <th class="px-3 py-2 text-left">Kategori</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Visits</th>
                  <th class="px-3 py-2 text-right bg-gray-50">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(r, idx) in rows" :key="idx" class="text-sm">
                  <td class="px-3 py-2">
                    <span class="inline-flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors[idx] }"></span>
                      <span class="font-medium text-gray-900">{{ r.name }}</span>
                    </span>
                  </td>
                  <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(r.visits) }}</td>
                  <td class="px-3 py-2 text-right bg-gray-50">
                    {{ total > 0 ? (r.visits / total * 100).toFixed(1) : '0.0' }}%
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-50 text-sm font-semibold text-gray-700">
                  <td class="px-3 py-2 text-left">Total</td>
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
