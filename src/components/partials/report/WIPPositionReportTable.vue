<script setup lang="ts">
import dayjs from 'dayjs';
import * as XLSX from 'xlsx'
const useApi = useApiFetchV2();

/** Samakan dengan payload backend */
const props = withDefaults(defineProps<{
  items: WIPPosition[] | null | undefined
  isFetching: boolean
  /** Pagination (server-side) */
  page?: number
  limit?: number
  total?: number
  hasNext?: boolean
  hasPrev?: boolean
  totalPages?: number
  from?: Date
  itemCode?: string
  itemName?: string
}>(), {
  page: 1,
  limit: 20,
  total: 0,
  hasNext: false,
  hasPrev: false,
  totalPages: 1,
  itemCode: '',
  itemName: '',
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
const nf = new Intl.NumberFormat('id-ID')

/* ================= Sorting sederhana ================= */
type SortKey = 'kode_barang' | 'nama_barang' | 'jumlah'
const sortKey = ref<SortKey>('kode_barang')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(k: SortKey) {
  if (sortKey.value === k) {
    sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
  } else {
    sortKey.value = k
    sortDir.value = k === 'jumlah' ? 'desc' : 'asc'
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

    if (k === 'jumlah') {
      va = toNum(va)
      vb = toNum(vb)
    }

    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb) * dir
    }
    return (va === vb ? 0 : (va > vb ? 1 : -1)) * dir
  })
})

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

async function exportExcel() {
  isExporting.value = true
  try {
    let filename = 'posisi-wip.xlsx'

    const data = await useApi.get(
      'report/wip-position/export',
      {
        from: props.from
          ? dayjs(props.from).format('YYYY-MM-DD')
          : dayjs().startOf('month').format('YYYY-MM-DD'),
        item_code: props.itemCode || '',
        item_name: props.itemName || '',
      },
      /* showToast */ false,
      {
        responseType: 'blob',
        // optional tapi berguna untuk baca filename dari header
        onResponse({ response }: { response: Response }) {
          const cd = response.headers.get('content-disposition')
          const m = cd && /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd)
          if (m) filename = decodeURIComponent(m[1] || m[2])
        },
        headers: {
          // opsional: hint ke server
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*'
        }
      }
    )

    // trigger download
    const url = URL.createObjectURL(data) // data adalah Blob
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    // kalau server balas JSON error, blob bisa berisi pesan
    console.error(err)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
      <!-- Header + Filter -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-base md:text-lg font-semibold text-gray-800">Laporan Posisi WIP</h3>
          <p class="text-sm text-gray-500">Laporan Posisi Work In Progress</p>
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
          <thead class="bg-gray-50 text-nowrap sticky top-0 z-10">
            <tr class="text-sm font-semibold text-gray-600">
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50 w-16">No</th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">
                <button class="inline-flex items-center gap-1" @click="toggleSort('kode_barang')">
                  Kode Barang
                  <span v-if="sortKey === 'kode_barang'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">
                <button class="inline-flex items-center gap-1" @click="toggleSort('nama_barang')">
                  Nama Barang
                  <span v-if="sortKey === 'nama_barang'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
              <th class="px-3 py-2 text-center border-r border-gray-200">Satuan</th>
              <th class="px-3 py-2 text-right bg-gray-50">
                <button class="inline-flex items-center gap-1" @click="toggleSort('jumlah')">
                  Jumlah
                  <span v-if="sortKey === 'jumlah'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm hover:bg-gray-50">
              <td class="px-3 py-2 border-r border-gray-200 text-center text-gray-500">
                {{ ((page - 1) * limit) + idx + 1 }}
              </td>
              <td class="px-3 py-2 border-r border-gray-200 font-mono text-sm">
                {{ r.kode_barang }}
              </td>
              <td class="px-3 py-2 border-r border-gray-200">
                {{ r.nama_barang }}
              </td>
              <td class="px-3 py-2 text-center border-r border-gray-200">
                {{ r.sat }}
              </td>
              <td class="px-3 py-2 text-right font-medium">
                {{ nf.format(toNum(r.jumlah)) }}
              </td>
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