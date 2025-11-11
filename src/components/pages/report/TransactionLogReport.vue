<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import dayjs from 'dayjs'
import DatePicker from 'primevue/datepicker';
import type { TransactionLog } from '/@src/types/TransactionLog'
import TransactionLogTable from '/@src/components/partials/report/TransactionLogTable.vue'
import { filter } from 'compression';

/**
 * Properties
 */
const router = useRouter()
const route = useRoute()
const toast = useToast();
const useApi = useApiFetchV2();

// Filter variables
const filterRange = ref<{
  start: Date | null
  end: Date | null
}>({
  start: route.query.start_date 
    ? dayjs(route.query.start_date as string).toDate() 
    : dayjs().startOf('month').toDate(),
  end: route.query.end_date 
    ? dayjs(route.query.end_date as string).toDate() 
    : dayjs().endOf('month').toDate(),
})
const userName = ref("")

// Track if filters have been cleared (to allow null dates after clear)
const isCleared = ref(false)

let debounceTimer: any;
watch(
  () => [filterRange.value.start, filterRange.value.end],
  () => {
    debounceTimer = setTimeout(() => {
      if (!isCleared.value) {
        router.replace({
          path: router.currentRoute.value.path,
          query: {
            start_date: filterRange.value.start ? dayjs(filterRange.value.start).format('YYYY-MM-DD') : null,
            end_date: filterRange.value.end ? dayjs(filterRange.value.end).format('YYYY-MM-DD') : null,
          }
        });
        handleFilterChange();
      }
    }, 500);
  },
  { deep: true }
);

/**
 * Transaction Logs Data
 */
const isFetchingReport = ref(false);
const transactionLogs = ref<TransactionLog[]>([]);
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const hasNext = ref(false)
const hasPrev = ref(false)
const totalPages = ref(1)

const transactionLogsData = async () => {
  isFetchingReport.value = true;
  const params: any = {
    page: page.value,
    limit: limit.value,
    user_name: userName.value || '',
  }
  
  // Only add dates if they are set (not cleared)
  if (!isCleared.value && filterRange.value.start) {
    params.start_date = dayjs(filterRange.value.start).format('YYYY-MM-DD')
  }
  if (!isCleared.value && filterRange.value.end) {
    params.end_date = dayjs(filterRange.value.end).format('YYYY-MM-DD')
  }

  await useApi.get('transaction-logs', params, false).then((res: any) => {
    // Map API response to TransactionLog type
    const mappedData = res.data.data.map((item: any): TransactionLog => ({
      trans_date: item.trans_date || '',
      user_name: item.user_name || '',
      module: item.module || '',
      action_code: item.action_code || '',
      activity_log: item.activity_log || '',
    }));

    transactionLogs.value = mappedData;

    // Handle response structure
    if (res.data) {
      total.value = res.data.total || 0;
      hasNext.value = res.data.has_next_page || false;
      hasPrev.value = res.data.has_prev_page || false;
      totalPages.value = res.data.total_pages || 1;
      if (res.data.page && res.data.page !== page.value) {
        page.value = res.data.page;
      }
    } else {
      total.value = 0;
      hasNext.value = false;
      hasPrev.value = false;
      totalPages.value = 1;
    }
  }).catch((err: any) => {
    console.log(err)
    transactionLogs.value = [];
    total.value = 0;
    hasNext.value = false;
    hasPrev.value = false;
    totalPages.value = 1;
  }).finally(() => {
    isFetchingReport.value = false;
  });
};

// Filter functions
const handleFilterChange = () => {
  page.value = 1; // Reset to first page when filter changes
  transactionLogsData();
}
function handleChangePage(p: number) {
  page.value = p
  transactionLogsData()
}
function handleChangeLimit(l: number) {
  limit.value = l
  page.value = 1 // Reset to first page when limit changes
  transactionLogsData()
}

const applyFilter = () => {
  page.value = 1; // Reset to first page when applying filter
  transactionLogsData();
}

onMounted(() => {
  transactionLogsData()
})

const clearUserName = () => {
  userName.value = "";
  handleFilterChange();
}

const clearStartDate = () => {
  filterRange.value.start = dayjs().startOf('month').toDate();
  isCleared.value = false;
  router.replace({
    path: router.currentRoute.value.path,
    query: {
      start_date: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
      end_date: filterRange.value.end ? dayjs(filterRange.value.end).format('YYYY-MM-DD') : null,
    }
  });
  handleFilterChange();
}

const clearEndDate = () => {
  filterRange.value.end = dayjs().endOf('month').toDate();
  isCleared.value = false;
  router.replace({
    path: router.currentRoute.value.path,
    query: {
      start_date: filterRange.value.start ? dayjs(filterRange.value.start).format('YYYY-MM-DD') : null,
      end_date: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
    }
  });
  handleFilterChange();
}

const clearAllDates = () => {
  isCleared.value = true;
  userName.value = "";
  filterRange.value.start = null;
  filterRange.value.end = null;
  router.replace({
    path: router.currentRoute.value.path,
    query: {}
  });
  handleFilterChange();
}
</script>

<template>
  <div class="sales-dashboard">
    <!--Header-->
    <div
      class="dashboard-header bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-3xl p-3 mt-5">
      <div class="flex flex-col lg:justify-between gap-3 w-full">

        <!-- Header Info Section -->
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Transaction Log Report
            </h3>
            <p class="text-gray-600 text-sm font-medium">Riwayat transaksi sistem berdasarkan periode dan user</p>
          </div>
        </div>

        <!-- Filter Controls Section -->
        <div class="filter-controls">
          <div class="relative w-full">
            <div class="flex flex-wrap gap-4 items-end">
              <!-- Range Date -->
              <div class="filter-group flex-1 min-w-[280px]">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Range
                  Date</label>
                <div class="booking-bar">
                  <div class="booking-bar-inputs">
                    <VControl class="control mr-4">
                      <div class="relative">
                        <DatePicker v-model="filterRange.start" dateFormat="dd-mm-yy"
                          inputClass="datepicker-input w-full px-[38px] py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer shadow-sm"
                          appendTo="body" placeholder="Start" />
                        <button 
                          v-if="filterRange.start && dayjs(filterRange.start).format('YYYY-MM-DD') !== dayjs().startOf('month').format('YYYY-MM-DD')" 
                          type="button" @click="clearStartDate"
                          class="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none z-10">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </VControl>

                    <VControl class="control">
                      <div class="relative">
                        <DatePicker v-model="filterRange.end" dateFormat="dd-mm-yy"
                          inputClass="datepicker-input w-full px-[38px] py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer shadow-sm"
                          appendTo="body" placeholder="End" />
                        <button 
                          v-if="filterRange.end && dayjs(filterRange.end).format('YYYY-MM-DD') !== dayjs().endOf('month').format('YYYY-MM-DD')" 
                          type="button" @click="clearEndDate"
                          class="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none z-10">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </VControl>
                  </div>
                </div>
              </div>

              <!-- User Name -->
              <div class="filter-group flex-1 min-w-[180px]">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  User Name
                </label>

                <div class="relative">
                  <input type="text" v-model="userName" @input="handleFilterChange" placeholder="Masukkan Username"
                    class="w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 
                           hover:border-gray-300 appearance-none cursor-text shadow-sm" aria-label="User Name" />

                  <!-- Tombol X di dalam input -->
                  <button v-if="userName" type="button" @click="clearUserName" aria-label="Clear userName"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Clear All Button -->
              <div class="filter-group">
                <button 
                  type="button" @click="clearAllDates"
                  class="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center space-x-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear All</span>
                </button>
              </div>
              
              <!-- Search Button -->
              <div class="filter-group ml-auto">
                <button @click="applyFilter"
                  class="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center justify-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TransactionLogTable :items="transactionLogs" :isFetching="isFetchingReport" :page="page" :limit="limit"
      :total="total" :hasNext="hasNext" :hasPrev="hasPrev" :totalPages="totalPages" :filterRange="filterRange"
      :userName="userName" @change-page="handleChangePage" @change-limit="handleChangeLimit" />
  </div>
</template>

<style lang="scss">
@import '/@src/scss/abstracts/all';

.sales-dashboard {
  .dashboard-header {
    display: flex;
    align-items: center;
    font-family: var(--font);
    margin-bottom: 24px;

    .start {
      margin-inline-start: 12px;

      h3 {
        font-family: var(--font-alt);
        font-weight: 600;
        font-size: 1.3rem;
        color: var(--dark-text);
      }
    }

    .end {
      margin-inline-start: auto;
      display: flex;
      justify-content: flex-end;

      .button {
        margin-inline-start: 10px;
      }
    }
  }

  .booking-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .booking-bar-inputs {
      display: flex;
      align-items: center;

      .control:not(:last-of-type) {
        margin-inline-end: 2rem;
      }

      .input {
        font-family: var(--font);
        color: var(--light-text);
      }
    }
  }
}

@media only screen and (width <=767px) {
  .sales-dashboard {
    .dashboard-header {
      text-align: center;
      flex-direction: column;

      .start {
        margin: 10px auto;
      }

      .end {
        margin: 0;
        justify-content: space-between;
      }
    }
  }

  .booking-bar {
    >div {
      width: 100%;
    }

    .booking-bar-inputs {
      flex-direction: column;
      width: 100%;

      .control {
        margin: 0 !important;
        width: 100% !important;

        &:first-child {
          margin-bottom: 1rem !important;
        }
      }
    }
  }
}

/* Filter Controls Styling */
.filter-controls {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

/* Dark mode support */
.is-dark {
  .filter-label {
    color: var(--white);
  }

  .filter-select {
    background: var(--dark-sidebar-light-5);
    border-color: var(--dark-sidebar-light-12);
    color: var(--white);

    &:focus {
      border-color: var(--primary);
    }

    &:hover {
      border-color: var(--primary-light-12);
    }
  }
}

/* Responsive design */
@media only screen and (width <=767px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-select {
    min-width: auto;
  }

  .apply-filter-btn {
    width: 100%;
  }
}
</style>
