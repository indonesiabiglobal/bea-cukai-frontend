<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ summary: VisitSummary | null | undefined; isFetching: boolean }>()

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const nf0 = new Intl.NumberFormat('id-ID')
const nf1 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pf1 = new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Pull metrics
const totalVisits        = computed(() => toNum(props.summary?.total_visits))
const uniquePatients     = computed(() => toNum(props.summary?.unique_patients))
const inpatientVisits    = computed(() => toNum(props.summary?.inpatient_visits))
const outpatientVisits   = computed(() => toNum(props.summary?.outpatient_visits))
const admittedFromOP     = computed(() => toNum(props.summary?.admitted_from_op))
const discharges         = computed(() => toNum(props.summary?.discharges))
const alosDays           = computed(() => toNum(props.summary?.alos_days))
const medianLOSDays      = computed(() => toNum(props.summary?.median_los_days))

// Derived
const ipShare = computed(() => totalVisits.value > 0 ? inpatientVisits.value / totalVisits.value : 0)
const opShare = computed(() => totalVisits.value > 0 ? outpatientVisits.value / totalVisits.value : 0)
const admitRateFromOP = computed(() => outpatientVisits.value > 0 ? admittedFromOP.value / outpatientVisits.value : 0)
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Visits Summary</h3>
        <span v-if="isFetching" class="text-xs text-gray-500">Loading…</span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div v-for="i in 6" :key="i" class="p-4 rounded-xl bg-gray-100 animate-pulse h-24" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!summary" class="flex items-center justify-center h-24 text-gray-500 text-sm">
        No data
      </div>

      <!-- KPI Cards -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <!-- Total Visits -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div class="text-xs font-medium text-blue-700">Total Visits</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-blue-900">{{ nf0.format(totalVisits) }}</div>
        </div>

        <!-- Unique Patients -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
          <div class="text-xs font-medium text-emerald-700">Unique Patients</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-emerald-900">{{ nf0.format(uniquePatients) }}</div>
        </div>

        <!-- Inpatient Visits (+share) -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
          <div class="flex items-center justify-between">
            <div class="text-xs font-medium text-indigo-700">Inpatient (IP)</div>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              {{ pf1.format(ipShare) }}
            </span>
          </div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-indigo-900">{{ nf0.format(inpatientVisits) }}</div>
          <div class="mt-2 h-1.5 bg-indigo-100 rounded">
            <div class="h-1.5 bg-indigo-500 rounded" :style="{ width: (ipShare * 100) + '%' }"></div>
          </div>
        </div>

        <!-- Outpatient Visits (+share) -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-100">
          <div class="flex items-center justify-between">
            <div class="text-xs font-medium text-orange-700">Outpatient (OP)</div>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
              {{ pf1.format(opShare) }}
            </span>
          </div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-orange-900">{{ nf0.format(outpatientVisits) }}</div>
          <div class="mt-2 h-1.5 bg-orange-100 rounded">
            <div class="h-1.5 bg-orange-500 rounded" :style="{ width: (opShare * 100) + '%' }"></div>
          </div>
        </div>

        <!-- Admitted from OP (count + rate vs OP) -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
          <div class="text-xs font-medium text-amber-700">Admitted from OP → IP</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-amber-900">{{ nf0.format(admittedFromOP) }}</div>
          <div class="text-[11px] text-amber-800 mt-1">
            {{ pf1.format(admitRateFromOP) }} dari OP
          </div>
        </div>

        <!-- Discharges + LOS -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-fuchsia-50 to-white border border-fuchsia-100">
          <div class="text-xs font-medium text-fuchsia-700">Discharges & LOS (IP)</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-fuchsia-900">{{ nf0.format(discharges) }}</div>
          <div class="text-[11px] text-fuchsia-800 mt-1">
            ALOS: {{ nf2.format(alosDays) }} hari · Median: {{ nf2.format(medianLOSDays) }} hari
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
