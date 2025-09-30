<script setup lang="ts">
import dayjs from 'dayjs';
import * as XLSX from 'xlsx'

/** Samakan dengan payload backend */
const props = withDefaults(defineProps<{
    items: MasterProduct[] | null | undefined
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
const nf = new Intl.NumberFormat('id-ID')

/* ================= Sorting sederhana ================= */
type SortKey = 'item_code' | 'item_name'
const sortKey = ref<SortKey>('item_code')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(k: SortKey) {
    if (sortKey.value === k) {
        sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
    } else {
        sortKey.value = k
        sortDir.value = 'asc'
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
    return `MasterDataProductReport_${y}${m}${d}_${hh}${mm}.xlsx`
})

async function exportExcel() {
    isExporting.value = true
    const data = sorted.value
    if (!data.length) return

    // Map ke bentuk tabular "rapi"
    const headers = [
        'Kode Barang',
        'Nama Barang',
        'Grup Item',
        'Tipe Item',
        'Satuan',
        'Safety Stock',
        'Satuan Beli',
        'Harga Beli',
        'Satuan Jual',
        'Harga Jual',
        'Last Cost',
        'Jenis Bahan',
        'Tebal',
        'Lebar',
        'Panjang',
        'Corona',
        'Embos',
        'Isi Per Gaiso',
        'Jumlah Gaiso',
        'Seal',
        'Lebar Hagata',
        'Dalam Hagata',
        'Tipe Hagata',
        'Isi Per Palet',
        'Gr Unit',
        'No Han',
        'Status',
        'Created By',
        'Created Date',
        'Updated By',
        'Updated Date',
    ]

    const rows = data.map((r, index) => {
        return {
            'Kode Barang': r.item_code || '',
            'Nama Barang': r.item_name || '',
            'Grup Item': r.item_group || '',
            'Tipe Item': r.item_type_code || '',
            'Satuan': r.unit_code || '',
            'Safety Stock': toNum(r.safety_stock),
            'Satuan Beli': r.pch_unit || '',
            'Harga Beli': toNum(r.pch_price),
            'Satuan Jual': r.sales_unit || '',
            'Harga Jual': toNum(r.sales_price),
            'Last Cost': toNum(r.last_cost),
            'Jenis Bahan': r.jenis_bahan || '',
            'Tebal': toNum(r.tebal),
            'Lebar': toNum(r.lebar),
            'Panjang': toNum(r.panjang),
            'Corona': r.corona ? 'Ya' : 'Tidak',
            'Embos': r.embos ? 'Ya' : 'Tidak',
            'Isi Per Gaiso': toNum(r.isi_per_gaiso),
            'Jumlah Gaiso': toNum(r.jml_gaiso),
            'Seal': r.seal || '',
            'Lebar Hagata': toNum(r.lebar_hagata),
            'Dalam Hagata': toNum(r.dalam_hagata),
            'Tipe Hagata': r.tipe_hagata || '',
            'Isi Per Palet': toNum(r.isi_per_palet),
            'Gr Unit': toNum(r.gr_unit),
            'No Han': toNum(r.no_han),
            'Status': toNum(r.inactive) ? 'Inactive' : 'Active',
            'Created By': r.created_by || '',
            'Created Date': r.created_date || '',
            'Updated By': r.updated_by || '',
            'Updated Date': r.updated_date || '',
        }
    })

    // Worksheet utama
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers })

    // Auto column width
    ws['!cols'] = autoColWidths(rows, headers)

    // Workbook & save
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'MasterDataProduct')
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
                    <h3 class="text-base md:text-lg font-semibold text-gray-800">Master Data Product</h3>
                    <p class="text-sm text-gray-500">Data Barang - Master Data Produk</p>
                </div>

                <div class="flex items-center gap-2 w-full lg:w-auto">
                    <!-- Tombol Export -->
                    <button
                        class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50 flex items-center gap-2"
                        :disabled="isFetching || isExporting" @click="exportExcel">
                        <svg v-if="isExporting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
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
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">No</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('item_code')">
                                    Kode Barang
                                    <span v-if="sortKey === 'item_code'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('item_name')">
                                    Nama Barang
                                    <span v-if="sortKey === 'item_name'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Grup Item</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Tipe Item</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Satuan</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Safety Stock</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Satuan Beli</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Harga Beli</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Satuan Jual</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Harga Jual</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Last Cost</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Jenis Bahan</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Tebal</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Lebar</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Panjang</th>
                            <th class="px-3 py-2 text-center border-r border-gray-200">Corona</th>
                            <th class="px-3 py-2 text-center border-r border-gray-200">Embos</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Isi/Gaiso</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Jml Gaiso</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Seal</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Lebar Hagata</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Dalam Hagata</th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50">Tipe Hagata</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Isi/Palet</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">Gr Unit</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">No Han</th>
                            <th class="px-3 py-2 text-center border-r border-gray-200">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm">
                            <td class="px-3 py-2 border-r border-gray-200">{{ (page - 1) * limit + idx + 1 }}</td>
                            <td class="px-3 py-2 border-r border-gray-200 font-semibold">{{ r.item_code }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.item_name }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.item_group }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.item_type_code }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.unit_code }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50 font-semibold">{{
                                nf.format(toNum(r.safety_stock)) }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.pch_unit }}</td>
                            <td
                                class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50 font-semibold text-green-600">
                                {{
                                    nf.format(toNum(r.pch_price)) }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.sales_unit }}</td>
                            <td
                                class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50 font-semibold text-blue-600">
                                {{
                                    nf.format(toNum(r.sales_price)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50 font-semibold">{{
                                nf.format(toNum(r.last_cost)) }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.jenis_bahan }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.tebal)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.lebar)) }}
                            </td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.panjang)) }}
                            </td>
                            <td class="px-3 py-2 text-center border-r border-gray-200">
                                <span :class="{
                                    'bg-green-100 text-green-800': r.corona,
                                    'bg-gray-100 text-gray-800': !r.corona
                                }" class="px-2 py-1 text-xs rounded-full font-medium">
                                    {{ r.corona ? 'Ya' : 'Tidak' }}
                                </span>
                            </td>
                            <td class="px-3 py-2 text-center border-r border-gray-200">
                                <span :class="{
                                    'bg-green-100 text-green-800': r.embos,
                                    'bg-gray-100 text-gray-800': !r.embos
                                }" class="px-2 py-1 text-xs rounded-full font-medium">
                                    {{ r.embos ? 'Ya' : 'Tidak' }}
                                </span>
                            </td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.isi_per_gaiso)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.jml_gaiso)) }}
                            </td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.seal }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.lebar_hagata)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.dalam_hagata)) }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.tipe_hagata }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.isi_per_palet)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.gr_unit)) }}
                            </td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">{{
                                nf.format(toNum(r.no_han)) }}
                            </td>
                            <td class="px-3 py-2 text-center border-r border-gray-200">
                                <span :class="{
                                    'bg-green-100 text-green-800': !toNum(r.inactive),
                                    'bg-red-100 text-red-800': toNum(r.inactive)
                                }" class="px-2 py-1 text-xs rounded-full font-medium">
                                    {{ toNum(r.inactive) ? 'Inactive' : 'Active' }}
                                </span>
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
                            <select :value="limit"
                                @change="changeLimit(Number(($event.target as HTMLSelectElement).value))"
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
                        <button class="px-3 py-1 text-sm border-r border-gray-200 transition-colors duration-200"
                            :class="{
                                'bg-blue-500 text-white hover:bg-blue-600': pageNum === page,
                                'hover:bg-gray-50 text-gray-700': pageNum !== page
                            }" @click="goPage(pageNum)">
                            {{ pageNum }}
                        </button>
                    </template>

                    <!-- Ellipsis after current range -->
                    <span v-if="page < totalPages - 3"
                        class="px-3 py-1 text-sm text-gray-400 border-r border-gray-200">...</span>

                    <!-- Last Page -->
                    <button v-if="page < totalPages - 2"
                        class="px-3 py-1 text-sm hover:bg-gray-50 border-r border-gray-200" @click="goPage(totalPages)">
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