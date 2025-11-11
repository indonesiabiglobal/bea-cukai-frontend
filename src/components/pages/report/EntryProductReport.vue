<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import dayjs from 'dayjs'
import DatePicker from 'primevue/datepicker';

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
const selectedPabeanType = ref("")
const selectedProductGroup = ref("")
const noPabean = ref("")
const productCode = ref("")
const productName = ref("")

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
 * Pabean Data
 */
const isFetchingCategory = ref(false);
"BC 2.0" 
"BC 2.3" 
"BC 2.5" 
"BC 2.6.1"
"BC 2.6.2"
"BC 2.7" 
"BC 3.0" 
"BC 4.0" 
"BC 4.1" 
const pabeanTypes: any = ref<PabeanTypes[]>([
  {
    pabean_code: "BC 2.0",
    pabean_name: "BC 2.0",
  },
  {
    pabean_code: "BC 2.3",
    pabean_name: "BC 2.3",
  },
  {
    pabean_code: "BC 2.5",
    pabean_name: "BC 2.5",
  },
  {
    pabean_code: "BC 2.6.1",
    pabean_name: "BC 2.6.1",
  },
  {
    pabean_code: "BC 2.6.2",
    pabean_name: "BC 2.6.2",
  },
  {
    pabean_code: "BC 2.7",
    pabean_name: "BC 2.7",
  },
  {
    pabean_code: "BC 3.0",
    pabean_name: "BC 3.0",
  },
  {
    pabean_code: "BC 4.0",
    pabean_name: "BC 4.0",
  },
  {
    pabean_code: "BC 4.1",
    pabean_name: "BC 4.1",
  },
]);

const pabeanTypeData = async () => {
  isFetchingCategory.value = true;
  await useApi.get('pabean', {}, false).then((res: any) => {
    pabeanTypes.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingCategory.value = false;
  });
};

/**
 * Category Data
 */
const isFetchingProductGroup = ref(false);
const productGroups: any = ref<ProductGroups>({
  product_group_id: '',
  product_group_name: '',
});

const productGroupData = async () => {
  isFetchingProductGroup.value = true;
  await useApi.get('item-groups', {}, false).then((res: any) => {
    productGroups.value = res.data.map((item: any) => ({
      product_group_id: item.idx,
      product_group_name: item.item_group,
    }))
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingProductGroup.value = false;
  });
};

/**
 * Entry Products
 */
const isFetchingReport = ref(false);
const entryProducts = ref<EntryProduct[]>([]);
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const hasNext = ref(false)
const hasPrev = ref(false)
const totalPages = ref(1)

const entryProductsData = async () => {
  isFetchingReport.value = true;
  await useApi.get('report/entry-products', {
    page: page.value,
    limit: limit.value,
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
    pabeanType: selectedPabeanType.value || '',
    productGroup: selectedProductGroup.value || '',
    noPabean: noPabean.value || '',
    productCode: productCode.value || '',
    productName: productName.value || '',
  }, false).then((res: any) => {
    // Map API response to EntryProduct type
    const mappedData = res.data.map((item: any, idx: number): EntryProduct => ({
      no: ((page.value - 1) * limit.value) + idx + 1,
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

    entryProducts.value = mappedData;

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
    entryProducts.value = [];
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
  entryProductsData();
}
function handleChangePage(p: number) {
  page.value = p
  entryProductsData()
}
function handleChangeLimit(l: number) {
  limit.value = l
  page.value = 1 // Reset to first page when limit changes
  entryProductsData()
}


const applyFilter = () => {
  page.value = 1; // Reset to first page when applying filter
  entryProductsData();
}

onMounted(() => {
  entryProductsData()
  // pabeanTypeData()
  productGroupData()
})

const clearCategory = () => {
  // kosongkan dan trigger filter
  selectedPabeanType.value = "";
  handleFilterChange();
}

const clearVendor = () => {
  selectedProductGroup.value = "";
  handleFilterChange();
}

const clearNoPabean = () => {
  noPabean.value = "";
  handleFilterChange();
}

const clearProductCode = () => {
  productCode.value = "";
  handleFilterChange();
}

const clearProductName = () => {
  productName.value = "";
  handleFilterChange();
}


</script>

<template>
  <div class="sales-dashboard">
    <!--Header-->
    <div
      class="dashboard-header bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-3xl p-3 mt-5">
      <div class="flex flex-col lg:justify-between gap-6 w-full">

        <!-- Header Info Section -->
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Laporan Pemasukan Barang
            </h3>
            <p class="text-gray-600 text-sm font-medium">Filter data berdasarkan periode dan kriteria yang dipilih</p>
          </div>
        </div>
        <!-- Filter Controls Section -->
        <div class="filter-controls">
          <div class="relative w-full">
            <div class="flex flex-wrap gap-4 items-end">
              <!-- Range Date -->
              <div class="filter-group w-full sm:w-auto flex-1 min-w-[280px]">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Range
                  Date</label>
                <div class="booking-bar">
                  <div class="booking-bar-inputs">
                    <VControl class="control mr-4">
                      <DatePicker v-model="filterRange.start" dateFormat="dd-mm-yy"
                        inputClass="datepicker-input w-full px-[38px] py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer shadow-sm"
                        appendTo="body" placeholder="Start" />
                    </VControl>

                    <VControl class="control">
                      <DatePicker v-model="filterRange.end" dateFormat="dd-mm-yy"
                        inputClass="datepicker-input w-full px-[38px] py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer shadow-sm"
                        appendTo="body" placeholder="End" />
                    </VControl>
                  </div>
                </div>
              </div>
              
              <!-- Jenis Pabean -->
              <div class="filter-group w-full sm:w-auto flex-1 min-w-[180px]">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Jenis Pabean
                  </label>
                </div>

                <div class="relative">
                  <select v-model="selectedPabeanType" class="w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
               focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 
               hover:border-gray-300 appearance-none cursor-pointer shadow-sm" @change="handleFilterChange">
                    <option value="">All Pabean Types</option>
                    <option v-for="pabeanType in pabeanTypes" :key="pabeanType.pabean_code"
                      :value="pabeanType.pabean_code">
                      {{ pabeanType.pabean_name }}
                    </option>
                  </select>

                  <!-- Tombol X di dalam input -->
                  <button v-if="selectedPabeanType" type="button" @click="clearCategory" aria-label="Clear pabeanType"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <!-- caret -->
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Grup Barang -->
              <div class="filter-group w-full sm:w-auto flex-1 min-w-[180px]">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Grup Barang
                  </label>
                </div>

                <div class="relative">
                  <select v-model="selectedProductGroup" class="w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
               focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 
               hover:border-gray-300 appearance-none cursor-pointer shadow-sm" @change="handleFilterChange">
                    <option value="">All Product Groups</option>
                    <option v-for="productGroup in productGroups" :key="productGroup.product_group_id"
                      :value="productGroup.product_group_id">
                      {{ productGroup.product_group_name }}
                    </option>
                  </select>

                  <!-- Tombol X di dalam input -->
                  <button v-if="selectedProductGroup" type="button" @click="clearVendor" aria-label="Clear pabeanType"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <!-- caret -->
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- No Pabean -->
              <div class="filter-group w-full sm:w-auto flex-1 min-w-[180px]">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    No. Pabean
                  </label>
                </div>

                <div class="relative">
                  <input type="text" v-model="noPabean" @input="handleFilterChange" placeholder="Masukkan No. Pabean"
                    class="w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 
                           hover:border-gray-300 appearance-none cursor-text shadow-sm" aria-label="No. Pabean" />

                  <!-- Tombol X di dalam input -->
                  <button v-if="noPabean" type="button" @click="clearNoPabean" aria-label="Clear noPabean"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Kode Barang -->
              <div class="filter-group w-full sm:w-auto flex-1 min-w-[180px]">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Kode Barang
                  </label>
                </div>

                <div class="relative">
                  <input type="text" v-model="productCode" @input="handleFilterChange"
                    placeholder="Masukkan Kode Barang" class="w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 
                           hover:border-gray-300 appearance-none cursor-text shadow-sm" aria-label="Kode Barang" />

                  <!-- Tombol X di dalam input -->
                  <button v-if="productCode" type="button" @click="clearProductCode" aria-label="Clear productCode"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Nama Barang -->
              <div class="filter-group w-full sm:w-auto flex-1 min-w-[180px]">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Nama Barang
                  </label>
                </div>

                <div class="relative">
                  <input type="text" v-model="productName" @input="handleFilterChange"
                    placeholder="Masukkan Nama Barang" class="w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 
                           hover:border-gray-300 appearance-none cursor-text shadow-sm" aria-label="Nama Barang" />

                  <!-- Tombol X di dalam input -->
                  <button v-if="productName" type="button" @click="clearProductName" aria-label="Clear productName"
                    class="absolute inset-y-0 right-7 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Search Button -->
              <div class="filter-group w-full sm:w-auto ml-auto">
                <button @click="applyFilter"
                  class="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-200 flex items-center justify-center space-x-2">
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
    <EntryProductReportTable :items="entryProducts" :isFetching="isFetchingReport" :page="page" :limit="limit"
      :total="total" :hasNext="hasNext" :hasPrev="hasPrev" :totalPages="totalPages" :filterRange="filterRange"
      :selectedPabeanType="selectedPabeanType" :selectedProductGroup="selectedProductGroup" :noPabean="noPabean"
      :productCode="productCode" :productName="productName" @change-page="handleChangePage"
      @change-limit="handleChangeLimit" />
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
