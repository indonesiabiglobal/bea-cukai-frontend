<script setup lang="ts">
import dayjs from 'dayjs';
import * as XLSX from 'xlsx'

/** Samakan dengan payload backend */
const props = withDefaults(defineProps<{
  items: EntryProduct[] | null | undefined
  isFetching: boolean
  /** Pagination (server-side) */
  page?: number
  limit?: number
  total?: number
  hasNext?: boolean
  hasPrev?: boolean
  totalPages?: number
}>(), {
  page: 1,
  limit: 20,
  total: 0,
  hasNext: false,
  hasPrev: false,
  totalPages: 1,
})

/** Emit ke parent kalau page berubah (server-side pagination) */
const emit = defineEmits<{
  (e: 'change-page', page: number): void
  (e: 'change-limit', limit: number): void
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

/* ================= Sorting sederhana ================= */
type SortKey = 'tgl_pabean' | 'tgl_bukti'
const sortKey = ref<SortKey>('tgl_pabean')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(k: SortKey) {
  if (sortKey.value === k) {
    sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
  } else {
    sortKey.value = k
    sortDir.value = k === 'tgl_pabean' ? 'asc' : 'desc'
  }
}

const sorted = computed(() => {
  const arr = (props.items || []).slice() // copy array
  if (!arr.length) return arr

  const k = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return arr.sort((a, b) => {
    let va: any = (a as any)[k]
    let vb: any = (b as any)[k]
    if (k === 'tgl_pabean' || k === 'tgl_bukti') {
      // use the extracted values (va/vb) instead of indexing a/b with SortKey to avoid TS errors
      va = new Date(va).getTime()
      vb = new Date(vb).getTime()
    }
    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb) * dir
    }
    return (va === vb ? 0 : (va > vb ? 1 : -1)) * dir
  })
})
/* ================= Ringkasan kecil ================= */

/* ================= Pagination (server-side) ================= */
const page = computed(() => props.page || 1)
const limit = computed(() => props.limit || 20)
const total = computed(() => props.total || 0)
const hasNext = computed(() => props.hasNext ?? false)
const hasPrev = computed(() => props.hasPrev ?? false)
const totalPages = computed(() => props.totalPages || Math.max(1, Math.ceil(total.value / limit.value)))

function goPage(p: number) {
  const np = Math.min(Math.max(1, p), totalPages.value)
  if (np !== page.value) emit('change-page', np)
}

function changeLimit(l: number) {
  emit('change-limit', l)
}

/* ========= EXPORT EXCEL ========= */
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
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  return `EntryProductReport_${y}${m}${d}_${hh}${mm}.xlsx`
})

function exportExcel() {
  const data = sorted.value
  if (!data.length) return

  // Map ke bentuk tabular “rapi”
  const headers = [
    'No',
    'Jenis Pabean',
    'No. Pabean',
    'Tgl Pabean',
    'No. Bukti',
    'Tgl Bukti',
    'Pengirim Barang',
    'Kode Barang',
    'Nama Barang',
    'Jumlah',
    'Sat',
    'Valas',
    'Nilai',
    'Ket',
  ]

  const rows = data.map((r, index) => {
    return {
      'No': index + 1,
      'Jenis Pabean': r.jenis_pabean || '',
      'No. Pabean': r.no_pabean || '',
      'Tgl Pabean': r.tgl_pabean ? dtf.format(new Date(r.tgl_pabean)) : '',
      'No. Bukti': r.no_bukti || '',
      'Tgl Bukti': r.tgl_bukti ? dtf.format(new Date(r.tgl_bukti)) : '',
      'Pengirim Barang': r.pengirim_barang || '',
      'Kode Barang': r.kode_barang || '',
      'Nama Barang': r.nama_barang || '',
      'Jumlah': toNum(r.jumlah),
      'Sat': r.sat || '',
      'Valas': r.valas || '',
      'Nilai': toNum(r.nilai),
      'Ket': r.ket || '',
    }
  })

  // Worksheet utama
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })

  // Auto column width
  ws['!cols'] = autoColWidths(rows, headers)

  // Workbook & save
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inpatients')
  XLSX.writeFile(wb, exportFileName.value)
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
      <!-- Header + Filter -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-base md:text-lg font-semibold text-gray-800">Laporan Pemasukan Barang</h3>
          <p class="text-sm text-gray-500">Laporan Penerimaan Barang Per Dokumen Pabean</p>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto">
          <!-- Tombol Export -->
          <button
            class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50"
            :disabled="isFetching || !sorted.length" @click="exportExcel">
            Export Excel
          </button>
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
      <div v-else class="overflow-x-auto rounded-xl border border-gray-200 max-h-[400px] overflow-y-auto max-h-[400px] overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 text-nowrap ">
            <tr class="text-sm font-semibold text-gray-600">
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">No</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Jenis Pabean</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">No. Pabean</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">
                <button class="inline-flex items-center gap-1" @click="toggleSort('tgl_pabean')">
                  Tgl Pabean
                  <span v-if="sortKey === 'tgl_pabean'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">No. Bukti</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">
                <button class="inline-flex items-center gap-1" @click="toggleSort('tgl_bukti')">
                  Tgl Bukti
                  <span v-if="sortKey === 'tgl_bukti'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Pengirim Barang</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Kode Barang</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Nama Barang</th>
              <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Jumlah</th>
              <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Sat</th>
              <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Valas</th>
              <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Nilai</th>
              <th class="px-3 py-2 text-right bg-gray-50">Ket</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm">
              <td class="px-3 py-2 border-r border-gray-200">{{ r.no }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.jenis_pabean }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.no_pabean }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.tgl_pabean ? dayjs(r.tgl_pabean).format('DD-MM-YYYY') : '-' }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.no_bukti }}</td>
              <td class="px-3 py-2 border-r border-gray-200 text-nowrap">{{ r.tgl_bukti ? dayjs(r.tgl_bukti).format('DD-MM-YYYY') : '-' }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.pengirim_barang }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.kode_barang }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.nama_barang }}</td>
              <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{ nf.format(toNum(r.jumlah)) }}</td>
              <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{ r.sat }}</td>
              <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{ r.valas || '-' }}</td>
              <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{ toNum(r.nilai) }}</td>
              <td class="px-3 py-2 text-right bg-gray-50">{{ r.ket || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (server-side) -->
      <div v-if="total > limit" class="flex items-center justify-between pt-2">
        <div class="text-sm text-gray-500">
          Page {{ page }} / {{ totalPages }} • {{ nf.format(total) }} rows
          <div class="flex items-center justify-between mt-2">
            <div class="text-sm text-gray-500">
              Show per page:
            </div>
            <div class="flex items-center gap-2">
              <select :value="limit" @change="changeLimit(Number(($event.target as HTMLSelectElement).value))"
                class="px-3 py-1 ml-2 text-sm border border-gray-200 rounded-md bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span class="text-sm text-gray-500">entries</span>
            </div>
          </div>
        </div>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button class="px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50" :disabled="!hasPrev"
            @click="goPage(page - 1)">Prev</button>
          <button class="px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50" :disabled="!hasNext"
            @click="goPage(page + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
