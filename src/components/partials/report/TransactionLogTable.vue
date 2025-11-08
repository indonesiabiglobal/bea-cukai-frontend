<script setup lang="ts">
import dayjs from 'dayjs';
import type { TransactionLog } from '/@src/types/TransactionLog'
const useApi = useApiFetchV2();

/** Props dari parent component */
const props = withDefaults(defineProps<{
    items: TransactionLog[] | null | undefined
    isFetching: boolean
    /** Pagination (server-side) */
    page?: number
    limit?: number
    total?: number
    hasNext?: boolean
    hasPrev?: boolean
    totalPages?: number
    filterRange?: { start: Date, end: Date }
    userName?: string
}>(), {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
    totalPages: 1,
    userName: '',
})

/** Emit ke parent kalau page berubah (server-side pagination) */
const emit = defineEmits<{
    (e: 'change-page', page: number): void
    (e: 'change-limit', limit: number): void
}>()

/* ================= Utils & Formatters ================= */
const nf = new Intl.NumberFormat('id-ID')

/* ================= Sorting sederhana ================= */
type SortKey = 'trans_date' | 'user_name' | 'module'
const sortKey = ref<SortKey>('trans_date')
const sortDir = ref<'asc' | 'desc'>('desc')

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

/* ========= Format Date ========= */
function formatDate(date: string) {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}

/* ========= EXPORT EXCEL ========= */
const isExporting = ref(false)

async function exportExcel() {
    isExporting.value = true
    try {
        let filename = 'transaction-log.xlsx'

        const data = await useApi.get(
            'transaction-logs/export',
            {
                start_date: props.filterRange?.start
                    ? dayjs(props.filterRange.start).format('YYYY-MM-DD')
                    : dayjs().startOf('month').format('YYYY-MM-DD'),
                end_date: props.filterRange?.end
                    ? dayjs(props.filterRange.end).format('YYYY-MM-DD')
                    : dayjs().endOf('month').format('YYYY-MM-DD'),
                user_name: props.userName || '',
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
            <!-- Header -->
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                    <h3 class="text-base md:text-lg font-semibold text-gray-800">Transaction Log</h3>
                    <p class="text-sm text-gray-500">Riwayat Transaksi Sistem</p>
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
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50" style="width: 150px">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('trans_date')">
                                    Tanggal
                                    <span v-if="sortKey === 'trans_date'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50" style="width: 150px">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('user_name')">
                                    User
                                    <span v-if="sortKey === 'user_name'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50" style="width: 200px">
                                <button class="inline-flex items-center gap-1" @click="toggleSort('module')">
                                    Module
                                    <span v-if="sortKey === 'module'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                                </button>
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50" style="width: 200px">
                                Kode Item/Transaksi
                            </th>
                            <th class="px-3 py-2 text-left border-r border-gray-200 bg-gray-50" style="width: 400px">
                                Log
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        <tr v-for="(r, idx) in sorted" :key="idx" class="text-sm hover:bg-gray-50">
                            <td class="px-3 py-2 border-r border-gray-200">{{ formatDate(r.trans_date) }}</td>
                            <td class="px-3 py-2 border-r border-gray-200 font-semibold">{{ r.user_name }}</td>
                            <td class="px-3 py-2 border-r border-gray-200">
                                <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                    {{ r.module }}
                                </span>
                            </td>
                            <td class="px-3 py-2 border-r border-gray-200 font-mono text-xs">{{ r.action_code }}</td>
                            <td class="px-3 py-2 border-r border-gray-200 text-gray-600">{{ r.activity_log }}</td>
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
