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
 * Summary Data
 */
const isFetchingSummary = ref(false);

const summary: any = ref<VisitSummary>({
  total_visits: 0,
  unique_patients: 0,
  inpatient_visits: 0,
  outpatient_visits: 0,
  admitted_from_op: 0,
  discharges: 0,
  alos_days: 0,
  median_los_days: 0
});

const summaryData = async () => {
  isFetchingSummary.value = true;
  await useApi.get('dashboard/visits/summary', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    summary.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingSummary.value = false;
  });
};

/**
 * Revenue Trend
 */
const isFetchingTrend = ref(false);
const revenueTrend: any = ref<VisitTrendPoint[]>([
  {
    date: new Date(),
    visits: 0,
    inpatient: 0,
    outpatient: 0,
    admits: 0
  }
]);

const trendData = async () => {
  isFetchingTrend.value = true;
  await useApi.get('dashboard/visits/trend', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    revenueTrend.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingTrend.value = false;
  });
};

/**
 * Top Unit
 */
const isFetchingTopService = ref(false);
const TopService = ref<TopServiceVisit[]>([]);

const topServiceData = async () => {
  isFetchingTopService.value = true;
  await useApi.get('dashboard/visits/top-services', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    TopService.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingTopService.value = false;
  });
};

/**
 * Top Guarantor
 */
const isFetchingTopGuarantor = ref(false);
const TopGuarantor = ref<TopGuarantorVisit[]>([]);

const topGuarantorData = async () => {
  isFetchingTopGuarantor.value = true;
  await useApi.get('dashboard/visits/top-guarantors', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    TopGuarantor.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingTopGuarantor.value = false;
  });
};

/**
 * Visit by Day of Week
 */
const isFetchingvisitByDayOfWeek = ref(false);
const visitByDayOfWeek = ref<VisitByDayOfWeek[]>([]);

const visitByDayOfWeekData = async () => {
  isFetchingvisitByDayOfWeek.value = true;
  await useApi.get('dashboard/visits/by-dow', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    visitByDayOfWeek.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingvisitByDayOfWeek.value = false;
  });
};

/**
 * Visiti by Day of Week
 */
const isFetchingvisitByRegion = ref(false);
const visitByRegion = ref<VisitByRegion[]>([]);

const visitByRegionData = async () => {
  isFetchingvisitByRegion.value = true;
  await useApi.get('dashboard/visits/by-region', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    visitByRegion.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingvisitByRegion.value = false;
  });
};

/**
 * Visiti IPOP
 */
const isFetchingvisitIPOP = ref(false);
const visitIPOP = ref<VisitIPOP[]>([]);

const visitIPOPData = async () => {
  isFetchingvisitIPOP.value = true;
  await useApi.get('dashboard/visits/mix-ipop', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    visitIPOP.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingvisitIPOP.value = false;
  });
};

/**
 * Visiti LOSBucketDischarge
 */
const isFetchingVisitLOSBucketDischarge = ref(false);
const visitLOSBucketDischarge = ref<VisitLOSBucketDischarge[]>([]);

const visitLOSBucketDischargeData = async () => {
  isFetchingVisitLOSBucketDischarge.value = true;
  await useApi.get('dashboard/visits/los-buckets', {
    from: dayjs(filterRange.value.start).format('YYYY-MM-DD'),
    to: dayjs(filterRange.value.end).format('YYYY-MM-DD'),
  }, false).then((res: any) => {
    visitLOSBucketDischarge.value = res.data
  }).catch((err: any) => {
    console.log(err)
  }).finally(() => {
    isFetchingVisitLOSBucketDischarge.value = false;
  });
};

// Filter functions
const handleFilterChange = () => {
  summaryData();
  trendData();
  topServiceData();
  topGuarantorData();
  visitByDayOfWeekData();
  visitByRegionData();
  visitIPOPData();
  visitLOSBucketDischargeData();
}

const applyFilter = () => {
  summaryData()
  trendData()
  topServiceData()
  topGuarantorData()
  visitByDayOfWeekData()
  visitByRegionData()
  visitIPOPData()
  visitLOSBucketDischargeData()
}

onMounted(() => {
  summaryData()
  trendData()
  topServiceData()
  topGuarantorData()
  visitByDayOfWeekData()
  visitByRegionData()
  visitIPOPData()
  visitLOSBucketDischargeData()
})


</script>

<template>
  <div class="sales-dashboard">
    <!--Header-->
    <div
      class="dashboard-header  bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-3xl p-5 mt-5">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 w-full">

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
              Visit Dashboard
            </h3>
            <p class="text-gray-600 text-sm font-medium">Filter data based on selected period and criteria</p>
          </div>
        </div>

        <!-- Filter Controls Section -->
        <div class="filter-controls ml-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end justify-items-end">
            <div class="booking-bar col-span-2">
              <ClientOnly>
                <label class="block text-xs font-semibold text-gray-700 mb-0 uppercase tracking-wide me-2">Range
                  Date:</label>
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
            <!-- Search Button -->
            <div class="filter-group w-full">
              <button @click="applyFilter" class="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-200 
                         flex items-center justify-center space-x-2">
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

    <VisitSummaryDashboard :summary="summary" :isFetching="isFetchingSummary" />

    <VisitTrendDashboard :items="revenueTrend" :isFetching="isFetchingTrend" />

    <TopServiceVisitDashboard :items="TopService" :isFetching="isFetchingTopService" :limit=10 />
    
    <TopGuarantorVisitDashboard :items="TopGuarantor" :isFetching="isFetchingTopGuarantor" :limit=10 />
    
    <VisitByDayOfWeekDashboard :items="visitByDayOfWeek" :isFetching="isFetchingvisitByDayOfWeek" />

    <VisitByRegionDashboard :items="visitByRegion" :isFetching="isFetchingvisitByRegion" :limit=10 />
    
    <VisitIPOPDashboard :items="visitIPOP" :isFetching="isFetchingvisitIPOP" />
    
    <VisitLOSBucketDischargeDashboard :items="visitLOSBucketDischarge" :isFetching="isFetchingVisitLOSBucketDischarge" />
  </div>
</template>


<style lang="scss" scoped>
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