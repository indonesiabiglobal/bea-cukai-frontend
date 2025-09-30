<script setup lang="ts">
import dayjs from 'dayjs';
import * as XLSX from 'xlsx'

const useApi = useApiFetchV2();

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
  /** Filter data for export */
  filterRange?: { start: Date, end: Date }
  selectedPabeanType?: string
  selectedProductGroup?: string
  noPabean?: string
  productCode?: string
  productName?: string
}>(), {
  page: 1,
  limit: 20,
  total: 0,
  hasNext: false,
  hasPrev: false,
  totalPages: 1,
  selectedPabeanType: '',
  selectedProductGroup: '',
  noPabean: '',
  productCode: '',
  productName: '',
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

// Computed property for visible page numbers (-2 to +2 around current page)
const visiblePages = computed(() => {
  const current = page.value
  const total = totalPages.value
  const pages: number[] = []

  // Calculate start and end of visible range
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  // Add pages in range
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

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
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  return `EntryProductReport_${y}${m}${d}_${hh}${mm}.xlsx`
})

async function exportExcel() {
  isExporting.value = true

  // Fetch all data from API without pagination
  let allData: EntryProduct[] = [];

  try {
    const response = await useApi.get('report/entry-products', {
      // Remove page and limit to get all data
      from: props.filterRange?.start ? dayjs(props.filterRange.start).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
      to: props.filterRange?.end ? dayjs(props.filterRange.end).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
      pabeanType: props.selectedPabeanType || '',
      productGroup: props.selectedProductGroup || '',
      noPabean: props.noPabean || '',
      productCode: props.productCode || '',
      productName: props.productName || '',
    }, false);

    // Map API response to EntryProduct type
    allData = response.data.map((item: any, idx: number): EntryProduct => ({
      no: idx + 1,
      jenis_pabean: item.jenis_pabean || '',
      no_pabean: item.no_pabean || '',
      tgl_pabean: item.tgl_pabean || '',
      no_bukti: item.vend_dlv_no || '',
      tgl_bukti: item.trans_date || '',
      pengirim_barang: item.vendor_name || '',
      kode_barang: item.item_code || '',
      nama_barang: item.item_name || '',
      jumlah: Number(item.rcv_qty) || 0,
      sat: item.pch_unit || '',
      valas: item.curr_code || null,
      nilai: item.net_price || 0,
      ket: '',
    }));
  } catch (error) {
    console.error('Error fetching export data:', error);
    // Fallback to current displayed data if API call fails
    allData = sorted.value;
  }

  if (!allData.length) {
    isExporting.value = false
    return
  }

  // Create workbook and worksheet with proper headers
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create worksheet with proper structure
  const ws = XLSX.utils.aoa_to_sheet([])

  // Add header information
  const currentDate = new Date()
  const dateStr = currentDate.toLocaleDateString('id-ID')

  // Header rows
  XLSX.utils.sheet_add_aoa(ws, [
    ['LAPORAN PENERIMAAN BARANG PER DOKUMEN PABEAN'],
    ['PT FUKUSUKE KOGYO INDONESIA'],
    [`PERIODE : ${dateStr}`],
    [], // Empty row
    // Main header with merged cells structure
    ['No.', 'DOKUMEN PABEAN', '', '', 'BUKTI PENERIMAAN BARANG', '', 'PENGIRIM', 'KODE', 'NAMA', 'JUMLAH', 'SATUAN', 'VALAS', 'NILAI'],
    ['', 'JENIS', 'NOMOR', 'TANGGAL', 'NOMOR', 'TANGGAL', 'BARANG', 'BARANG', 'BARANG', '', '', '', '']
  ], { origin: 'A1' })

  // Add data rows starting from row 7
  const dataRows = allData.map((r, index) => [
    index + 1,
    r.jenis_pabean || '',
    r.no_pabean || '',
    r.tgl_pabean ? dtf.format(new Date(r.tgl_pabean)) : '',
    r.no_bukti || '',
    r.tgl_bukti ? dtf.format(new Date(r.tgl_bukti)) : '',
    r.pengirim_barang || '',
    r.kode_barang || '',
    r.nama_barang || '',
    toNum(r.jumlah),
    r.sat || '',
    r.valas || '',
    toNum(r.nilai)
  ])

  XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: 'A7' })

  // Merge cells for headers
  const merges = [
    { s: { c: 0, r: 0 }, e: { c: 12, r: 0 } }, // Title row
    { s: { c: 0, r: 1 }, e: { c: 12, r: 1 } }, // Company row
    { s: { c: 0, r: 2 }, e: { c: 12, r: 2 } }, // Period row
    // Main header merges
    { s: { c: 0, r: 4 }, e: { c: 0, r: 5 } }, // No. column
    { s: { c: 1, r: 4 }, e: { c: 3, r: 4 } }, // DOKUMEN PABEAN
    { s: { c: 4, r: 4 }, e: { c: 5, r: 4 } }, // BUKTI PENERIMAAN BARANG
    { s: { c: 6, r: 4 }, e: { c: 6, r: 5 } }, // PENGIRIM BARANG
    { s: { c: 7, r: 4 }, e: { c: 7, r: 5 } }, // KODE BARANG
    { s: { c: 8, r: 4 }, e: { c: 8, r: 5 } }, // NAMA BARANG
    { s: { c: 9, r: 4 }, e: { c: 9, r: 5 } }, // JUMLAH
    { s: { c: 10, r: 4 }, e: { c: 10, r: 5 } }, // SATUAN
    { s: { c: 11, r: 4 }, e: { c: 11, r: 5 } }, // VALAS
    { s: { c: 12, r: 4 }, e: { c: 12, r: 5 } }, // NILAI
  ]

  ws['!merges'] = merges

  // Set column widths
  const colWidths = [
    { wch: 5 },   // No
    { wch: 12 },  // Jenis
    { wch: 15 },  // No Pabean
    { wch: 12 },  // Tgl Pabean
    { wch: 15 },  // No Bukti
    { wch: 12 },  // Tgl Bukti
    { wch: 20 },  // Pengirim
    { wch: 15 },  // Kode Barang
    { wch: 25 },  // Nama Barang
    { wch: 10 },  // Jumlah
    { wch: 8 },   // Satuan
    { wch: 8 },   // Valas
    { wch: 15 },  // Nilai
  ]
  ws['!cols'] = colWidths

  // Set row heights for better appearance
  if (!ws['!rows']) ws['!rows'] = []
  ws['!rows'][0] = { hpt: 25 } // Title row height
  ws['!rows'][1] = { hpt: 20 } // Company row height
  ws['!rows'][2] = { hpt: 20 } // Period row height
  ws['!rows'][4] = { hpt: 25 } // Header row height
  ws['!rows'][5] = { hpt: 25 } // Sub-header row height

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pemasukan Barang')

  // Save file
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
          <h3 class="text-base md:text-lg font-semibold text-gray-800">Laporan Pemasukan Barang</h3>
          <p class="text-sm text-gray-500">Laporan Penerimaan Barang Per Dokumen Pabean</p>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto">
          <!-- Tombol Export -->
          <button
            class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50 flex items-center gap-2"
            :disabled="isFetching || isExporting" @click="exportExcel">
            <svg v-if="isExporting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ isExporting ? 'Exporting...' : 'Export Excel' }}
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
      <div v-else class="overflow-x-auto rounded-xl border border-gray-200 max-h-[400px] overflow-y-auto">
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
              <td class="px-3 py-2 border-r border-gray-200">{{ r.tgl_pabean ? dayjs(r.tgl_pabean).format('DD-MM-YYYY')
                : '-' }}</td>
              <td class="px-3 py-2 border-r border-gray-200">{{ r.no_bukti }}</td>
              <td class="px-3 py-2 border-r border-gray-200 text-nowrap">{{ r.tgl_bukti ?
                dayjs(r.tgl_bukti).format('DD-MM-YYYY') : '-' }}</td>
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
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200 bg-white">
          <!-- Previous Button -->
          <button class="px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 border-r border-gray-200"
            :disabled="!hasPrev" @click="goPage(page - 1)">
            Prev
          </button>

          <!-- First Page -->
          <button v-if="page > 3" class="px-3 py-1 text-sm hover:bg-gray-50 border-r border-gray-200"
            @click="goPage(1)">
            1
          </button>

          <!-- Ellipsis before current range -->
          <span v-if="page > 4" class="px-3 py-1 text-sm text-gray-400 border-r border-gray-200">...</span>

          <!-- Page numbers around current page (-2 to +2) -->
          <template v-for="pageNum in visiblePages" :key="pageNum">
            <button class="px-3 py-1 text-sm border-r border-gray-200 transition-colors duration-200" :class="{
              'bg-blue-500 text-white hover:bg-blue-600': pageNum === page,
              'hover:bg-gray-50 text-gray-700': pageNum !== page
            }" @click="goPage(pageNum)">
              {{ pageNum }}
            </button>
          </template>

          <!-- Ellipsis after current range -->
          <span v-if="page < totalPages - 3" class="px-3 py-1 text-sm text-gray-400 border-r border-gray-200">...</span>

          <!-- Last Page -->
          <button v-if="page < totalPages - 2" class="px-3 py-1 text-sm hover:bg-gray-50 border-r border-gray-200"
            @click="goPage(totalPages)">
            {{ totalPages }}
          </button>

          <!-- Next Button -->
          <button class="px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50" :disabled="!hasNext"
            @click="goPage(page + 1)">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
