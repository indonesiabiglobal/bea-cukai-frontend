<script setup lang="ts">
import dayjs from 'dayjs';
import * as XLSX from 'xlsx'

/** Samakan dengan payload backend */
const props = withDefaults(defineProps<{
    items: RejectScrapProduct[] | null | undefined
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
    return `RejectScrapProductReport_${y}${m}${d}_${hh}${mm}.xlsx`
})

function exportExcel() {
    const data = sorted.value
    if (!data.length) return

    // Map ke bentuk tabular "rapi"
    const headers = [
        'Kode Barang',
        'Nama Barang',
        'Grup Item',
        'Tipe Item',
        'Kode Lokasi',
        'Kode Unit',
        'Saldo Awal',
        'Masuk',
        'Keluar',
        'Opname',
        'Penyesuaian',
        'Selisih',
        'Saldo Akhir',
    ]

    const rows = data.map((r, index) => {
        return {
            'Kode Barang': r.item_code || '',
            'Nama Barang': r.item_name || '',
            'Grup Item': r.item_group || '',
            'Tipe Item': r.item_type_code || '',
            'Kode Lokasi': r.location_code || '',
            'Kode Unit': r.unit_code || '',
            'Saldo Awal': toNum(r.awal),
            'Masuk': toNum(r.masuk),
            'Keluar': toNum(r.keluar),
            'Opname': toNum(r.opname),
            'Penyesuaian': toNum(r.peny),
            'Selisih': toNum(r.selisih),
            'Saldo Akhir': toNum(r.akhir),
        }
    })

    // Worksheet utama
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers })

    // Auto column width
    ws['!cols'] = autoColWidths(rows, headers)

    // Workbook & save
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RejectScrapProduct')
    XLSX.writeFile(wb, exportFileName.value)
}
</script>

<template>
    <div class="w-full mb-4">
        <div class="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
            <!-- Header + Filter -->
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                    <h3 class="text-base md:text-lg font-semibold text-gray-800">Laporan Barang Reject & Scrap</h3>
                    <p class="text-sm text-gray-500">Laporan Pertanggung Jawaban Mutasi Barang Reject & Scrap</p>
                </div>

                <div class="flex items-center gap-2 w-full lg:w-auto">
                    <!-- Tombol Export -->
                    <button
                        class="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white shadow disabled:opacity-50"
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
            <div v-else class="overflow-x-auto rounded-xl border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 text-nowrap">
                        <tr class="text-sm font-semibold text-gray-600">
                            <th class="px-3 py-2 text-left border-r border-gray-200">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('item_code')">
                                    Kode Barang
                                    <span v-if="sortKey === 'item_code'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('item_name')">
                                    Nama Barang
                                    <span v-if="sortKey === 'item_name'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200">Sat</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">Saldo Awal</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">Pemasukan</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">Pengeluaran</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">Penyesuaian</th>
                            <th class="px-3 py-2 text-right font-bold text-blue-600">Saldo Buku</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">Stok Opname</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">Selisih</th>
                            <th class="px-3 py-2 text-right border-r border-gray-200">ket</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm">
                            <td class="px-3 py-2 border-r border-gray-200 font-semibold">{{ r.item_code }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.item_name }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">{{ r.unit_code }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 font-semibold">{{
                                nf.format(toNum(r.awal)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 font-semibold text-green-600">{{
                                nf.format(toNum(r.masuk)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 font-semibold text-red-600">{{
                                nf.format(toNum(r.keluar)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 font-semibold">{{
                                nf.format(toNum(r.peny)) }}</td>
                            <td class="px-3 py-2 text-right font-bold text-blue-600">{{ nf.format(toNum(r.akhir)) }}
                            </td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 font-semibold">{{
                                nf.format(toNum(r.opname)) }}</td>
                            <td class="px-3 py-2 text-right border-r border-gray-200 font-semibold" :class="{
                                'text-green-600': toNum(r.selisih) > 0,
                                'text-red-600': toNum(r.selisih) < 0
                            }">{{ nf.format(toNum(r.selisih)) }}</td>
                            <td class="px-3 py-2 border-r border-gray-200"></td>
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