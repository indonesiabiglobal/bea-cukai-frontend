<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ summary: SaleSummary | null | undefined; isFetching: boolean }>()

const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')

// pull metrics
const totalSubtotal = computed(() => toNum(props.summary?.total_subtotal))
const totalQty = computed(() => toNum(props.summary?.total_qty))
const uniqueItems = computed(() => toNum(props.summary?.unique_items))
const txCount = computed(() => toNum(props.summary?.tx_count))

// derived
const avgUnitPrice = computed(() => (totalQty.value > 0 ? Math.round(totalSubtotal.value / totalQty.value) : 0))
const avgPerTx = computed(() => (txCount.value > 0 ? Math.round(totalSubtotal.value / txCount.value) : 0))
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base md:text-lg font-semibold text-gray-800">Sales Summary</h3>
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
        <!-- Total Revenue -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div class="text-xs font-medium text-blue-700">Total Revenue</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-blue-900">{{ cf.format(totalSubtotal) }}</div>
        </div>

        <!-- Total Qty -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
          <div class="text-xs font-medium text-emerald-700">Total Qty</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-emerald-900">{{ nf.format(totalQty) }}</div>
        </div>

        <!-- Avg Unit Price -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
          <div class="text-xs font-medium text-amber-700">Avg Unit Price</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-amber-900">{{ cf.format(avgUnitPrice) }}</div>
        </div>

        <!-- Unique Items -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100">
          <div class="text-xs font-medium text-cyan-700">Unique Items</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-cyan-900">{{ nf.format(uniqueItems) }}</div>
        </div>

        <!-- Transactions -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
          <div class="text-xs font-medium text-gray-600">Transactions</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-gray-900">{{ nf.format(txCount) }}</div>
        </div>

        <!-- Avg per Tx -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-fuchsia-50 to-white border border-fuchsia-100">
          <div class="text-xs font-medium text-fuchsia-700">Avg per Tx</div>
          <div class="mt-1 text-xl md:text-2xl font-bold text-fuchsia-900">{{ cf.format(avgPerTx) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
