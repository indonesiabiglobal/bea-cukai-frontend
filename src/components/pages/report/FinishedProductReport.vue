<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import dayjs from 'dayjs'

/**
 * Properties
 */
const router = useRouter()
const route = useRoute()
const toast = useToast();
const useApi = useApiFetchV2();

// Filter variables
const filterRange = ref({
  start: route.query.start_date ? dayjs(route.query.start_date as string || new Date()).toDate() : dayjs().startOf('month').toDate(),
  end: route.query.end_date ? dayjs(route.query.end_date as string || new Date()).toDate() : dayjs().endOf('month').toDate(),
})
const itemCode = ref("")
const itemName = ref("")

let debounceTimer: any;
watch(
  () => [filterRange.value.start, filterRange.value.end],
  () => {
    debounceTimer = setTimeout(() => {
      router.replace({
        path: router.currentRoute.value.path,
        query: {
          start_date: filterRange.value.start ? dayjs(filterRange.value.start).format('YYYY-MM-DD') : null,
          end_date: filterRange.value.end ? dayjs(filterRange.value.end).format('YYYY-MM-DD') : null,
        }
      });
      handleFilterChange();
    }, 500);
  },
  { deep: true }
);

/**
 * Finished Products Data
 */
const isFetchingReport = ref(false);
const finishedProducts = ref<FinishedProduct[]>([]);
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const hasNext = ref(false)
const hasPrev = ref(false)
const totalPages = ref(1)

const finishedProductsData = async () => {
  isFetchingReport.value = true;
  await useApi.get('report/finished-product', {
    page: page.value,
    limit: limit.value,
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
    item_code: itemCode.value || '',
    item_name: itemName.value || '',
  }, false).then((res: any) => {
    // Map API response to FinishedProduct type
    const mappedData = res.data.map((item: any): FinishedProduct => ({
      akhir: item.akhir || 0,
      akhr: item.akhr || 0,
      item_code: item.item_code || '',
      item_group: item.item_group || '',
      item_name: item.item_name || '',
      item_type_code: item.item_type_code || '',
      keluar: item.keluar || 0,
      location_code: item.location_code || '',
      masuk: item.masuk || 0,
      msk: item.msk || 0,
      opname: item.opname || 0,
      peny: item.peny || 0,
      selisih: item.selisih || 0,
      unit_code: item.unit_code || '',
    }));

    finishedProducts.value = mappedData;

    // Handle meta and pagination info
    if (res.meta && res.meta.pagination) {
      total.value = res.meta.pagination.totalCount || 0;
      hasNext.value = res.meta.pagination.hasNext || false;
      hasPrev.value = res.meta.pagination.hasPrev || false;
      totalPages.value = res.meta.pagination.totalPages || 1;
      // Update current page if different from response
      if (res.meta.pagination.page && res.meta.pagination.page !== page.value) {
        page.value = res.meta.pagination.page;
      }
    } else if (res.total !== undefined) {
      total.value = res.total;
      // Fallback calculations for hasNext/hasPrev
      hasNext.value = page.value * limit.value < total.value;
      hasPrev.value = page.value > 1;
      totalPages.value = Math.max(1, Math.ceil(total.value / limit.value));
    } else if (res.pagination && res.pagination.total) {
      total.value = res.pagination.total;
      hasNext.value = res.pagination.hasNext || false;
      hasPrev.value = res.pagination.hasPrev || false;
      totalPages.value = res.pagination.totalPages || 1;
    } else {
      // Fallback: estimate total based on current page and data length
      total.value = (page.value - 1) * limit.value + mappedData.length;
      hasNext.value = mappedData.length === limit.value;
      hasPrev.value = page.value > 1;
      totalPages.value = Math.max(1, Math.ceil(total.value / limit.value));
    }
  }).catch((err: any) => {
    console.log(err)
    finishedProducts.value = [];
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
  finishedProductsData();
}
function handleChangePage(p: number) {
  page.value = p
  finishedProductsData()
}
function handleChangeLimit(l: number) {
  limit.value = l
  page.value = 1 // Reset to first page when limit changes
  finishedProductsData()
}

const applyFilter = () => {
  page.value = 1; // Reset to first page when applying filter
  finishedProductsData();
}

onMounted(() => {
  finishedProductsData()
})

const clearItemCode = () => {
  itemCode.value = "";
  handleFilterChange();
}

const clearItemName = () => {
  itemName.value = "";
  handleFilterChange();
}
</script>

<template>
  <div class="sales-dashboard">
    <!--Header-->
    <div
      class="dashboard-header sticky top-0 z-10 bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-3xl p-6 mt-4">
      <div class="flex flex-col lg:justify-between gap-6 w-full">

        <!-- Header Info Section -->
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
              </path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Laporan Pertanggung Jawaban Mutasi Barang Jadi
            </h3>
            <p class="text-gray-600 text-sm font-medium">Filter data berdasarkan periode dan kriteria yang dipilih</p>
          </div>
        </div>
        <!-- Filter Controls Section -->
        <div class="filter-controls">
          <div class="relative w-full">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end justify-items-end">
              <!-- Range Date -->
              <div class="filter-group w-full col-span-2">
                <label class="block text-xs font-semibold text-gray-700 mb-0 uppercase tracking-wide me-2">Range
                  Date:</label>
                <div class="booking-bar col-span-2">
                  <ClientOnly>
                    <VDatePicker v-model.range="filterRange" color="green" trim-weeks show-weeknumbers
                      :first-day-of-week="2">
                      <template #default="{ inputValue, inputEvents }">
                        <div class="booking-bar-inputs">
                          <VControl icon="lucide:calendar">
                            <input type="text" class="w-full px-[38px] py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 
                             hover:border-gray-300 appearance-none cursor-pointer shadow-sm" placeholder="Start"
                              :value="inputValue.start" v-on="inputEvents.start">
                          </VControl>
                          <VControl icon="lucide:calendar">
                            <input type="text" class="w-full px-[38px] py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 
                             hover:border-gray-300 appearance-none cursor-pointer shadow-sm" placeholder="End"
                              :value="inputValue.end" v-on="inputEvents.end">
                          </VControl>
                        </div>
                      </template>
                    </VDatePicker>
                  </ClientOnly>
                </div>
              </div>

              <!-- Kode Item -->
              <div class="filter-group w-full col-span-1">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Kode Barang
                  </label>
                </div>

                <div class="relative">
                  <input type="text" v-model="itemCode" @input="handleFilterChange"
                    placeholder="Masukkan Kode Barang" class="w-full px-4 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 
                           hover:border-gray-300 appearance-none cursor-text shadow-sm" aria-label="Kode Barang" />

                  <!-- Tombol X di dalam input -->
                  <button v-if="itemCode" type="button" @click="clearItemCode" aria-label="Clear itemCode"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Nama Item -->
              <div class="filter-group w-full col-span-1">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Nama Barang
                  </label>
                </div>

                <div class="relative">
                  <input type="text" v-model="itemName" @input="handleFilterChange"
                    placeholder="Masukkan Nama Barang" class="w-full px-4 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 
                           hover:border-gray-300 appearance-none cursor-text shadow-sm" aria-label="Nama Barang" />

                  <!-- Tombol X di dalam input -->
                  <button v-if="itemName" type="button" @click="clearItemName" aria-label="Clear itemName"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-3 flex justify-end">
              <button @click="applyFilter"
                class="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                       text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                       transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Apply Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <FinishedProductReportTable :items="finishedProducts" :isFetching="isFetchingReport" :page="page" :limit="limit"
      :total="total" :hasNext="hasNext" :hasPrev="hasPrev" :totalPages="totalPages" @change-page="handleChangePage" @change-limit="handleChangeLimit" />
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

  .spark-tiles {
    .spark-tile {
      @include vuero-s-card;

      padding: 0;
    }
  }

  .dashboard-metrics {
    margin-bottom: 30px;

    .metric-card {
      @include vuero-s-card;
      padding: 20px;
      text-align: center;

      .card-header {
        margin-bottom: 15px;

        h4 {
          font-family: var(--font-alt);
          font-size: 1rem;
          font-weight: 600;
          color: var(--dark-text);
        }
      }

      .gauge-container {
        position: relative;
        height: 150px;

        .gauge-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-alt);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          z-index: 2;
        }

        .gauge-chart {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: var(--fade-grey-light-3);
          border: 8px solid var(--fade-grey-light-3);

          .gauge-progress {
            position: absolute;
            top: -8px;
            left: -8px;
            width: calc(100% + 16px);
            height: calc(100% + 16px);
            border-radius: 50%;
            background: conic-gradient(var(--primary) 0deg, var(--primary) 226deg, transparent 226deg);
            transform-origin: center center;
            transition: all 1s ease-in-out;
          }
        }

        .gauge-range {
          position: absolute;
          bottom: -30px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
          box-sizing: border-box;

          span {
            font-size: 0.875rem;
            color: var(--light-text);
          }
        }
      }

      &.bor-card {
        .gauge-container {
          .gauge-value {
            font-size: 2rem;
            color: var(--primary);
          }
        }
      }
    }

    .metric-cards {
      display: flex;
      justify-content: space-between;
      gap: 15px;

      .metric-card {
        flex: 1;
        text-align: center;
        padding: 15px 10px;

        .metric-value {
          font-family: var(--font-alt);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dark-text);
          margin-bottom: 5px;
        }

        .metric-label {
          font-size: 0.9rem;
          color: var(--light-text);
        }

        &.negative {
          .metric-value {
            color: var(--danger);
          }
        }
      }
    }

    .chart-card {
      @include vuero-s-card;
      padding: 20px;

      .card-header {
        margin-bottom: 15px;

        h4 {
          font-family: var(--font-alt);
          font-size: 1rem;
          font-weight: 600;
          color: var(--dark-text);
        }
      }

      .chart-container {
        position: relative;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .dashboard-card {
    @include vuero-s-card;

    &:not(:last-child) {
      margin-bottom: 1.5rem;
    }

    &.flex-chart {
      height: calc(50% - 0.75rem);
    }

    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      h3 {
        font-family: var(--font-alt);
        font-size: 1rem;
        font-weight: 600;
        color: var(--dark-text);
      }
    }

    .revenue-stats {
      display: flex;
      margin-bottom: 10px;

      .revenue-stat {
        margin-inline-end: 30px;
        font-family: var(--font);

        span {
          display: block;

          &:first-child {
            color: var(--light-text);
            font-size: 0.9rem;
          }

          &:nth-child(2) {
            color: var(--dark-text);
            font-size: 1.2rem;
            font-weight: 600;
          }

          &.current {
            color: var(--primary);
          }
        }
      }
    }

    .chart-media {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .meta {
        margin-inline-end: 30px;
        align-items: center;
        font-family: var(--font);

        h4 {
          font-family: var(--font-alt);
          font-size: 1rem;
          font-weight: 600;
          color: var(--dark-text);
        }

        span {
          display: block;
          color: var(--dark-text);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        p {
          font-size: 0.9rem;
        }
      }

      .chart-container {
        min-width: 110px;
        flex-shrink: 0;
        max-width: 120px;
      }
    }

    .chart-group {
      display: flex;

      .group {
        text-align: center;
        width: 33.3%;

        .chart-container {
          margin-top: -5px;
        }

        span {
          display: block;
          margin-top: -25px;
          font-family: var(--font);
          color: var(--dark-text);
          font-weight: 600;
          font-size: 1.2rem;
        }

        p {
          font-size: 0.9rem;
        }
      }
    }
  }

  .widget {
    min-height: 305px;
  }
}

.is-dark {
  .sales-dashboard {

    .spark-tile,
    .dashboard-card {
      @include vuero-card--dark;
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

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dark-text);
  margin-bottom: 4px;
}

.filter-select {
  padding: 10px 12px;
  border: 2px solid var(--fade-grey-light-3);
  border-radius: 8px;
  background: var(--white);
  color: var(--dark-text);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }

  &:hover {
    border-color: var(--primary-light-12);
  }
}

.apply-filter-btn {
  height: 42px;
  padding: 0 20px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }
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

  .dashboard-metrics {
    .metric-card {
      @include vuero-card--dark;

      .card-header h4 {
        color: var(--white);
      }

      .gauge-container {
        .gauge-value {
          color: var(--primary);
        }

        .gauge-chart {
          background: var(--dark-sidebar-light-5);
          border-color: var(--dark-sidebar-light-12);
        }

        .gauge-range span {
          color: var(--light-text);
        }
      }

      .metric-value {
        color: var(--white);
      }

      .metric-label {
        color: var(--light-text);
      }
    }

    .chart-card {
      @include vuero-card--dark;

      .card-header h4 {
        color: var(--white);
      }

      .chart-container {
        .data-point {
          .point-value {
            color: var(--primary);
          }

          .point-period {
            color: var(--light-text);
          }
        }

        .average-line {
          .avg-label {
            background: var(--dark-sidebar-light-5);
            color: var(--danger);
          }
        }
      }
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