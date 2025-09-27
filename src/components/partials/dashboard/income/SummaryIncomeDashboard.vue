<script setup lang="ts">

const props = defineProps<{ summary: SummaryDTO, isFetching: boolean }>();

// ---- formatter & helper ----
const nf = new Intl.NumberFormat('id-ID');
const cf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const toNum = (v: unknown) => (typeof v === 'string' ? Number(v) : (Number(v) || 0));

const debitVal = computed(() => toNum(props.summary?.total_debit));
const creditVal = computed(() => toNum(props.summary?.total_credit));
const netVal = computed(() => toNum(props.summary?.net));

const debitFmt = computed(() => cf.format(debitVal.value));
const creditFmt = computed(() => cf.format(creditVal.value));
const netAbsFmt = computed(() => cf.format(Math.abs(netVal.value)));

const patientsFmt = computed(() => nf.format(props.summary?.unique_patients ?? 0));
const episodesFmt = computed(() => nf.format(props.summary?.unique_episodes ?? 0));
const txFmt = computed(() => nf.format(props.summary?.tx_count ?? 0));

const netIsPos = computed(() => netVal.value >= 0);
const netSign = computed(() => (netIsPos.value ? '▲' : '▼'));
const netColor = computed(() => (netIsPos.value ? 'text-emerald-600' : 'text-rose-600'));
const netBg = computed(() => (netIsPos.value ? 'bg-emerald-50' : 'bg-rose-50'));

</script>

<template>
    <!-- ===== Income Summary (KPI) ===== -->
    <div class="w-full mb-4">
        <!-- Loading skeleton -->
        <div v-if="isFetching" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow p-4 animate-pulse">
                <div class="h-3 w-24 bg-gray-200 rounded mb-3"></div>
                <div class="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>

        <!-- KPI cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <!-- Gross (Debit) -->
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gross (Debit)</div>
                <div class="mt-1 text-2xl font-bold text-gray-900">{{ debitFmt }}</div>
                <div class="mt-1 text-[11px] text-gray-500">Produksi/charge pada periode</div>
            </div>

            <!-- Cash/Collections (Credit) -->
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Collections (Credit)</div>
                <div class="mt-1 text-2xl font-bold text-gray-900">{{ creditFmt }}</div>
                <div class="mt-1 text-[11px] text-gray-500">Pembayaran + penyesuaian</div>
            </div>

            <!-- AR Delta (Net = Debit - Credit) -->
            <div class="rounded-xl shadow p-4" :class="netBg">
                <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Δ Piutang (Net)</div>
                <div class="mt-1 flex items-baseline gap-2">
                    <span :class="['text-2xl font-bold', netColor]">
                        {{ netSign }} {{ netAbsFmt }}
                    </span>
                </div>
                <div class="mt-1 text-[11px] text-gray-500">Debit − Credit</div>
            </div>

            <!-- Unique Patients -->
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patients</div>
                <div class="mt-1 text-2xl font-bold text-gray-900">{{ patientsFmt }}</div>
                <div class="mt-1 text-[11px] text-gray-500">Jumlah pasien unik</div>
            </div>

            <!-- Unique Episodes -->
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Episodes</div>
                <div class="mt-1 text-2xl font-bold text-gray-900">{{ episodesFmt }}</div>
                <div class="mt-1 text-[11px] text-gray-500">Episode unik</div>
            </div>

            <!-- Transactions -->
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transactions</div>
                <div class="mt-1 text-2xl font-bold text-gray-900">{{ txFmt }}</div>
                <div class="mt-1 text-[11px] text-gray-500">Jumlah transaksi</div>
            </div>
        </div>
    </div>
    <!-- ===== /Income Summary (KPI) ===== -->
</template>