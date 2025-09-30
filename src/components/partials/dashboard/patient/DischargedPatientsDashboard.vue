<script setup lang="ts">
import * as XLSX from 'xlsx'

type DischargedRow = {
	patient_id: string
	patient_name: string
	episode: number
	admission_service_type: string
	diagnosis: string
	admission_reason: string
	dpjp: string
	nama_penjamin: string | null
	start_date: string // ISO (Go time.Time)
	end_date: string   // ISO
	los_days: number
	los_hours_exact: number
	total_debit: string | number
	total_credit: string | number
}

const props = withDefaults(defineProps<{
	items: DischargedRow[] | null | undefined
	isFetching: boolean
	page?: number
	limit?: number
	total?: number
	summary?: {
		total: number
		page: number
		limit: number
		average_los: number
		median_los: number
		total_debit?: number
		total_credit?: number
	}
}>(), {
	page: 1,
	limit: 20,
	total: 0,
	meta: () => ({ total: 0, page: 1, limit: 20, average_los: 0, median_los: 0, total_debit: 0, total_credit: 0 }),
})

const emit = defineEmits<{
	(e: 'change-page', page: number): void
	(e: 'change-filter', guarantor: string): void
}>()

/* ===== Utils & formatters ===== */
const toNum = (v: unknown) => {
	if (v == null) return 0
	const n = typeof v === 'number' ? v : Number(v)
	return Number.isFinite(n) ? n : 0
}
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const nf = new Intl.NumberFormat('id-ID')
const dtf = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })
const parseDate = (s?: string | null) => {
	if (!s) return null
	const d = new Date(s)
	return Number.isFinite(d.getTime()) ? d : null
}

/* ===== Filter by guarantor ===== */
const selectedGuarantor = ref<string>('ALL')

const guarantorOptions = computed(() => {
	const set = new Set<string>()
	for (const r of (props.items ?? [])) {
		const name = (r?.nama_penjamin ?? '').trim()
		set.add(name || 'UNKNOWN')
	}
	return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
})

const filtered = computed(() => {
	const src = props.items ?? []
	if (selectedGuarantor.value === 'ALL') return src
	const wantUnknown = selectedGuarantor.value === 'UNKNOWN'
	const want = wantUnknown ? '' : selectedGuarantor.value
	return src.filter(r => ((r?.nama_penjamin ?? '').trim() || '') === want)
})

watch(selectedGuarantor, g => emit('change-filter', g))

/* ===== Sorting ===== */
type SortKey =
	| 'patient_name' | 'episode' | 'admission_service_type'
	| 'dpjp' | 'nama_penjamin' | 'start_date' | 'end_date'
	| 'los_days' | 'total_debit' | 'total_credit'

const sortKey = ref<SortKey>('end_date')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(k: SortKey) {
	if (sortKey.value === k) {
		sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
	} else {
		sortKey.value = k
		sortDir.value = (k === 'patient_name' || k === 'admission_service_type' || k === 'dpjp' || k === 'nama_penjamin') ? 'asc' : 'desc'
	}
}

const sorted = computed(() => {
	const arr = [...filtered.value]
	const k = sortKey.value
	const dir = sortDir.value === 'asc' ? 1 : -1
	return arr.sort((a, b) => {
		let va: any = (a as any)[k]
		let vb: any = (b as any)[k]
		if (k === 'start_date' || k === 'end_date') {
			va = parseDate(a[k])?.getTime() ?? 0
			vb = parseDate(b[k])?.getTime() ?? 0
		}
		if (k === 'los_days' || k === 'total_debit' || k === 'total_credit') {
			va = toNum(va); vb = toNum(vb)
		}
		if (typeof va === 'string' && typeof vb === 'string') {
			return va.localeCompare(vb) * dir
		}
		return (va === vb ? 0 : (va > vb ? 1 : -1)) * dir
	})
})

/* ===== KPI ringkas ===== */
const avgLOS = computed(() => props.summary?.average_los ?? 0)
const medianLOS = computed(() => props.summary?.median_los ?? 0)
const totalDebit = computed(() => props.summary?.total_debit ?? 0)
const totalCredit = computed(() => props.summary?.total_credit ?? 0)
const totalNet = computed(() => totalDebit.value - totalCredit.value)

/* ===== Pagination (server-side) ===== */
const page = computed(() => props.page || 1)
const limit = computed(() => props.limit || 20)
const total = computed(() => props.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

function goPage(p: number) {
	const np = Math.min(Math.max(1, p), totalPages.value)
	if (np !== page.value) emit('change-page', np)
}
/* ===== EXPORT EXCEL ===== */
function autoColWidths(rows: any[], headers: string[]) {
	const lens = headers.map(h => h.length)
	for (const r of rows) {
		headers.forEach((h, i) => {
			const v = r[h]
			const s = v == null ? '' : String(v)
			lens[i] = Math.max(lens[i], s.length)
		})
	}
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
	return `DischargedPatients_${y}${m}${d}_${hh}${mm}.xlsx`
})

async function exportExcel() {
  isExporting.value = true
	const data = sorted.value
	if (!data.length) return

	const headers = [
		'Patient ID', 'Patient Name', 'Episode',
		'Service Admission Type', 'Admission Reason', 'Diagnosis',
		'DPJP', 'Guarantor',
		'Start Date', 'End Date',
		'LOS (days)', 'LOS (hours)',
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
			'Start Date': parseDate(r.start_date) ? dtf.format(parseDate(r.start_date)!) : '',
			'End Date': parseDate(r.end_date) ? dtf.format(parseDate(r.end_date)!) : '',
			'LOS (days)': toNum(r.los_days),
			'LOS (hours)': Number(toNum(r.los_hours_exact).toFixed(2)),
			'Debit': debit,
			'Credit': credit,
			'Net': Number((debit - credit).toFixed(2)),
		}
	})

	// Worksheet data
	const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
	ws['!cols'] = autoColWidths(rows, headers)

	// Summary sheet (pakai props.summary + filter aktif)
	const sum = [
		{ Metric: 'Total Discharges (page)', Value: total.value },
		{ Metric: 'Avg LOS (days)', Value: Number(avgLOS.value.toFixed(2)) },
		{ Metric: 'Median LOS (days)', Value: Number(medianLOS.value.toFixed(2)) },
		{ Metric: 'Total Debit', Value: Number(totalDebit.value) },
		{ Metric: 'Total Credit', Value: Number(totalCredit.value) },
		{ Metric: 'Net', Value: Number(totalNet.value) },
		{ Metric: 'Filter Guarantor', Value: selectedGuarantor.value },
		{ Metric: 'Page / Limit', Value: `${page.value} / ${limit.value}` },
	]
	const wsSummary = XLSX.utils.json_to_sheet(sum)
	wsSummary['!cols'] = [{ wch: 26 }, { wch: 22 }]

	// Workbook
	const wb = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
	XLSX.utils.book_append_sheet(wb, ws, 'Discharges')
	XLSX.writeFile(wb, exportFileName.value)
}

</script>

<template>
	<div class="w-full mb-4">
		<div class="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
			<!-- Header + Filter -->
			<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
				<div>
					<h3 class="text-base md:text-lg font-semibold text-gray-800">Discharged Patients</h3>
					<p class="text-xs text-gray-500">Pasien rawat inap yang sudah pulang pada periode filter</p>
				</div>

				<div class="flex items-center gap-2">
					<label class="text-xs font-semibold text-gray-700">Guarantor</label>
					<select v-model="selectedGuarantor"
						class="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 cursor-pointer shadow-sm">
						<option v-for="g in guarantorOptions" :key="g" :value="g">{{ g }}</option>
					</select>

					<!-- Tombol Export -->
					<button
						class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50"
						:disabled="isFetching || !sorted.length" @click="exportExcel">
						Export
					</button>
				</div>
			</div>

			<!-- KPI kecil -->
			<div class="grid grid-cols-2 md:grid-cols-5 gap-3">
				<div class="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
					<div class="text-xs font-medium text-indigo-700">Total Discharges</div>
					<div class="mt-1 text-xl font-bold text-indigo-900">{{ nf.format(total) }}</div>
				</div>
				<div class="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
					<div class="text-xs font-medium text-emerald-700">Avg LOS (hari)</div>
					<div class="mt-1 text-xl font-bold text-emerald-900">{{ avgLOS.toFixed(2) }}</div>
				</div>
				<div class="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
					<div class="text-xs font-medium text-amber-700">Median LOS (hari)</div>
					<div class="mt-1 text-xl font-bold text-amber-900">{{ medianLOS.toFixed(2) }}</div>
				</div>
				<div class="p-3 rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100">
					<div class="text-xs font-medium text-sky-700">Total Debit</div>
					<div class="mt-1 text-xl font-bold text-sky-900">{{ cf.format(totalDebit) }}</div>
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
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('patient_name')">
									Patient
									<span v-if="sortKey === 'patient_name'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('episode')">
									Episode
									<span v-if="sortKey === 'episode'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('admission_service_type')">
									Service
									<span v-if="sortKey === 'admission_service_type'">{{ sortDir === 'asc' ? '▲' : '▼'
									}}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('dpjp')">
									DPJP
									<span v-if="sortKey === 'dpjp'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('nama_penjamin')">
									Penjamin
									<span v-if="sortKey === 'nama_penjamin'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('start_date')">
									Start
									<span v-if="sortKey === 'start_date'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-left">
								<button class="inline-flex items-center gap-1" @click="toggleSort('end_date')">
									End
									<span v-if="sortKey === 'end_date'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-right bg-gray-50">
								<button class="inline-flex items-center gap-1" @click="toggleSort('los_days')">
									LOS (hari)
									<span v-if="sortKey === 'los_days'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-right bg-gray-50">
								<button class="inline-flex items-center gap-1" @click="toggleSort('total_debit')">
									Debit
									<span v-if="sortKey === 'total_debit'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
							<th class="px-3 py-2 text-right bg-gray-50">
								<button class="inline-flex items-center gap-1" @click="toggleSort('total_credit')">
									Credit
									<span v-if="sortKey === 'total_credit'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
								</button>
							</th>
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
							<td class="px-3 py-2">
								<div class="flex flex-col">
									<span class="text-gray-900">{{ r.admission_service_type }}</span>
									<span v-if="r.diagnosis" class="text-xs text-gray-500 truncate">{{ r.diagnosis
									}}</span>
								</div>
							</td>
							<td class="px-3 py-2">{{ r.dpjp || '-' }}</td>
							<td class="px-3 py-2">{{ (r.nama_penjamin || '').trim() || 'UNKNOWN' }}</td>
							<td class="px-3 py-2">
								{{ parseDate(r.start_date) ? dtf.format(parseDate(r.start_date)!) : '-' }}
							</td>
							<td class="px-3 py-2">
								{{ parseDate(r.end_date) ? dtf.format(parseDate(r.end_date)!) : '-' }}
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

			<!-- Pagination -->
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
