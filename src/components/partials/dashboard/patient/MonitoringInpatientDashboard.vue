<script setup lang="ts">
import * as XLSX from 'xlsx'

/** Samakan dengan payload backend */
type InpatientMonitoringRow = {
  patient_id: string
  patient_name: string
  episode: number
  admission_service_type: string
  diagnosis: string
  admission_reason: string
  dpjp: string
  nama_penjamin: string | null
  start_date: string // ISO string
  los_days: number
  los_hours_exact: number
  total_debit: string | number
  total_credit: string | number
}

const props = withDefaults(defineProps<{
  items: InpatientMonitoringRow[] | null | undefined
  isFetching: boolean
  /** Pagination (server-side) */
  page?: number
  limit?: number
  total?: number
}>(), {
  page: 1,
  limit: 20,
  total: 0,
})

/** Emit ke parent kalau page berubah (server-side pagination) */
const emit = defineEmits<{
  (e: 'change-page', page: number): void
  (e: 'change-filter', guarantor: string): void
}>()

/* ================= Utils & Formatters ================= */
const toNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')
const dtf = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })

/* ================= Filter by nama_penjamin ================= */
const selectedGuarantor = ref<string>('ALL')

/** Option unik nama_penjamin dari data */
const guarantorOptions = computed(() => {
  const set = new Set<string>()
  for (const r of (props.items ?? [])) {
    const name = (r?.nama_penjamin ?? '').trim()
    set.add(name || 'UNKNOWN')
  }
  return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
})

/** Data yang sudah difilter */
const filtered = computed(() => {
  const src = props.items ?? []
  if (selectedGuarantor.value === 'ALL') return src
  const key = selectedGuarantor.value === 'UNKNOWN' ? '' : selectedGuarantor.value
  return src.filter(r => {
    const name = (r?.nama_penjamin ?? '').trim()
    if (selectedGuarantor.value === 'UNKNOWN') return !name
    return name === key
  })
})

watch(selectedGuarantor, (g) => emit('change-filter', g))

/* ================= Sorting sederhana ================= */
type SortKey = 'patient_name' | 'dpjp' | 'nama_penjamin' | 'start_date' | 'los_days'
const sortKey = ref<SortKey>('los_days')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(k: SortKey) {
  if (sortKey.value === k) {
    sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
  } else {
    sortKey.value = k
    sortDir.value = k === 'patient_name' ? 'asc' : 'desc'
  }
}

const sorted = computed(() => {
  const arr = [...filtered.value]
  const k = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return arr.sort((a, b) => {
    let va: any = (a as any)[k]
    let vb: any = (b as any)[k]
    if (k === 'start_date') {
      va = new Date(a.start_date).getTime()
      vb = new Date(b.start_date).getTime()
    }
    if (k === 'los_days') {
      va = toNum(a.los_days); vb = toNum(b.los_days)
    }
    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb) * dir
    }
    return (va === vb ? 0 : (va > vb ? 1 : -1)) * dir
  })
})

/* ================= Ringkasan kecil ================= */
const totalRows = computed(() => sorted.value.length)
const avgLOS = computed(() => {
  if (!sorted.value.length) return 0
  const s = sorted.value.reduce((sum, r) => sum + toNum(r.los_days), 0)
  return s / sorted.value.length
})
const totalDebit = computed(() => sorted.value.reduce((s, r) => s + toNum(r.total_debit), 0))
const totalCredit = computed(() => sorted.value.reduce((s, r) => s + toNum(r.total_credit), 0))

/* ================= Pagination (server-side) ================= */
const page = computed(() => props.page || 1)
const limit = computed(() => props.limit || 20)
const total = computed(() => props.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

function goPage(p: number) {
  const np = Math.min(Math.max(1, p), totalPages.value)
  if (np !== page.value) emit('change-page', np)
}

/* ========= EXPORT EXCEL ========= */
const isExporting = ref(false)
function autoColWidths(rows: any[], headers: string[]) {
  const lens = headers.map(h => h.length)
  for (const r of rows) {
    headers.forEach((h, i) => {
      const v = r[h]
      const s = v == null ? '' : String(v)
      lens[i] = Math.max(lens[i], s.length)
    })
  }
  // approx width: char count + padding
  return lens.map(ch => ({ wch: Math.min(Math.max(ch + 2, 8), 50) }))
}

const exportFileName = computed(() => {
  // contoh: InpatientMonitoring_20250822_1630.xlsx
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  return `InpatientMonitoring_${y}${m}${d}_${hh}${mm}.xlsx`
})

async function exportExcel() {
  isExporting.value = true
  const data = sorted.value
  if (!data.length) return

  // Map ke bentuk tabular “rapi”
  const headers = [
    'Patient ID', 'Patient Name', 'Episode',
    'Service Admission Type', 'Admission Reason', 'Diagnosis', 'DPJP', 'Guarantor',
    'Start Date', 'LOS (days)', 'LOS (hours)',
    'Debit', 'Credit', 'Net'
  ]

  const rows = data.map(r => {
    const debit = toNum(r.total_debit)
    const credit = toNum(r.total_credit)
    return {
      'Patient ID': r.patient_id,
      'Patient Name': r.patient_name,
      'Episode': r.episode,
      'Service Admission Type': r.admission_service_type,
      'Admission Reason': r.admission_reason,
      'Diagnosis': r.diagnosis,
      'DPJP': r.dpjp,
      'Guarantor': (r.nama_penjamin ?? '').trim() || 'UNKNOWN',
      'Start Date': r.start_date ? dtf.format(new Date(r.start_date)) : '',
      'LOS (days)': toNum(r.los_days),
      'LOS (hours)': Number(toNum(r.los_hours_exact).toFixed(2)),
      'Debit': debit,                     // number (biar bisa SUM di Excel)
      'Credit': credit,                   // number
      'Net': Number((debit - credit).toFixed(2)),
    }
  })

  // Worksheet utama
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })

  // Auto column width
  ws['!cols'] = autoColWidths(rows, headers)

  // Sheet Summary kecil di depan
  const summary = [
    { Metric: 'Total Patients', Value: totalRows.value },
    { Metric: 'Avg LOS (days)', Value: Number(avgLOS.value.toFixed(2)) },
    { Metric: 'Total Debit', Value: totalDebit.value },
    { Metric: 'Total Credit', Value: totalCredit.value },
    { Metric: 'Net', Value: Number((totalDebit.value - totalCredit.value).toFixed(2)) },
    { Metric: 'Filter Guarantor', Value: selectedGuarantor.value },
  ]
  const wsSummary = XLSX.utils.json_to_sheet(summary)
  wsSummary['!cols'] = [{ wch: 22 }, { wch: 18 }]

  // Workbook & save
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
  XLSX.utils.book_append_sheet(wb, ws, 'Inpatients')
  XLSX.writeFile(wb, exportFileName.value)

  isExporting.value = false
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
      <!-- Header + Filter -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-base md:text-lg font-semibold text-gray-800">Monitoring Inpatient</h3>
          <p class="text-xs text-gray-500">Rawat inap aktif (LOS dihitung s/d saat ini)</p>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto">
          <label class="text-xs font-semibold text-gray-700">Guarantor</label>
          <select v-model="selectedGuarantor"
            class="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 cursor-pointer shadow-sm">
            <option v-for="g in guarantorOptions" :key="g" :value="g">{{ g }}</option>
          </select>

          <!-- Tombol Export -->
          <button
            class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50"
            :disabled="isFetching || !sorted.length"
            @click="exportExcel">
            Export
          </button>
        </div>
      </div>

      <!-- KPI kecil -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
          <div class="text-xs font-medium text-indigo-700">Total Patients</div>
          <div class="mt-1 text-xl font-bold text-indigo-900">{{ nf.format(totalRows) }}</div>
        </div>
        <div class="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
          <div class="text-xs font-medium text-emerald-700">Avg LOS (hari)</div>
          <div class="mt-1 text-xl font-bold text-emerald-900">{{ avgLOS.toFixed(2) }}</div>
        </div>
        <div class="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
          <div class="text-xs font-medium text-amber-700">Total Debit</div>
          <div class="mt-1 text-xl font-bold text-amber-900">{{ cf.format(totalDebit) }}</div>
        </div>
        <div class="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100">
          <div class="text-xs font-medium text-rose-700">Total Credit</div>
          <div class="mt-1 text-xl font-bold text-rose-900">{{ cf.format(totalCredit) }}</div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isFetching" class="h-[360px] w-full animate-pulse bg-gray-100 rounded-xl" />

      <!-- Empty -->
      <div v-else-if="!items || items.length === 0"
        class="h-[200px] w-full flex items-center justify-center text-gray-500 text-sm">
        No data
      </div>

      <!-- Table -->
      <div v-else class="overflow-auto rounded-xl border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr class="text-xs font-semibold text-gray-600">
              <th class="px-3 py-2 text-left">Patient</th>
              <th class="px-3 py-2 text-left">Episode</th>
              <th class="px-3 py-2 text-left">Service Admission Type</th>
              <th class="px-3 py-2 text-left">Admission Reason</th>
              <th class="px-3 py-2 text-left">Diagnosis</th>
              <th class="px-3 py-2 text-left">DPJP</th>
              <th class="px-3 py-2 text-left">
                <button class="inline-flex items-center gap-1" @click="toggleSort('nama_penjamin')">
                  Penjamin
                  <span v-if="sortKey === 'nama_penjamin'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-left">
                <button class="inline-flex items-center gap-1" @click="toggleSort('start_date')">
                  Start Date
                  <span v-if="sortKey === 'start_date'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-right bg-gray-50">
                <button class="inline-flex items-center gap-1" @click="toggleSort('los_days')">
                  LOS (hari)
                  <span v-if="sortKey === 'los_days'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-right bg-gray-50">Debit</th>
              <th class="px-3 py-2 text-right bg-gray-50">Credit</th>
              <th class="px-3 py-2 text-right bg-gray-50">Net</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm">
              <td class="px-3 py-2">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">{{ r.patient_name }}</span>
                  <span class="text-xs text-gray-500">{{ r.patient_id }}</span>
                </div>
              </td>
              <td class="px-3 py-2">{{ r.episode }}</td>
              <td class="px-3 py-2">{{ r.admission_service_type }}</td>
              <td class="px-3 py-2">{{ r.admission_reason }}</td>
              <td class="px-3 py-2">{{ r.diagnosis }}</td>
              <td class="px-3 py-2">{{ r.dpjp || '-' }}</td>
              <td class="px-3 py-2">{{ (r.nama_penjamin || '').trim() || 'UNKNOWN' }}</td>
              <td class="px-3 py-2">
                {{ r.start_date ? dtf.format(new Date(r.start_date)) : '-' }}
              </td>
              <td class="px-3 py-2 text-right bg-gray-50">{{ nf.format(r.los_days) }}</td>
              <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(toNum(r.total_debit)) }}</td>
              <td class="px-3 py-2 text-right bg-gray-50">{{ cf.format(toNum(r.total_credit)) }}</td>
              <td class="px-3 py-2 text-right bg-gray-50">
                {{ cf.format(toNum(r.total_debit) - toNum(r.total_credit)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (server-side) -->
      <div v-if="total > limit" class="flex items-center justify-between pt-2">
        <div class="text-xs text-gray-500">
          Page {{ page }} / {{ totalPages }} • {{ nf.format(total) }} rows
        </div>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button class="px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50" :disabled="page <= 1"
            @click="goPage(page - 1)">Prev</button>
          <button class="px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50" :disabled="page >= totalPages"
            @click="goPage(page + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
