<!-- Contoh implementasi Tailwind CSS untuk summary cards dashboard -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    
    <!-- Total Debit Card -->
    <div class="card border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Debit
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2" v-if="!isFetching">
              {{ formatCurrency(summary.total_debit) }}
            </p>
            <div v-else class="animate-pulse bg-gray-200 h-8 w-24 rounded mt-2"></div>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <i class="fas fa-plus-circle text-blue-600 text-xl"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-green-500 text-sm font-medium">↗ +12%</span>
          <span class="text-gray-500 text-sm ml-2">dari bulan lalu</span>
        </div>
      </div>
    </div>

    <!-- Total Credit Card -->
    <div class="card border-l-4 border-red-500 transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Credit
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2" v-if="!isFetching">
              {{ formatCurrency(summary.total_credit) }}
            </p>
            <div v-else class="animate-pulse bg-gray-200 h-8 w-24 rounded mt-2"></div>
          </div>
          <div class="bg-red-100 p-3 rounded-full">
            <i class="fas fa-minus-circle text-red-600 text-xl"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-red-500 text-sm font-medium">↘ -5%</span>
          <span class="text-gray-500 text-sm ml-2">dari bulan lalu</span>
        </div>
      </div>
    </div>

    <!-- Net Income Card -->
    <div class="card border-l-4 border-green-500 transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Net Income
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2" v-if="!isFetching">
              {{ formatCurrency(summary.net) }}
            </p>
            <div v-else class="animate-pulse bg-gray-200 h-8 w-24 rounded mt-2"></div>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <i class="fas fa-chart-line text-green-600 text-xl"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-green-500 text-sm font-medium">↗ +8%</span>
          <span class="text-gray-500 text-sm ml-2">dari bulan lalu</span>
        </div>
      </div>
    </div>

    <!-- Unique Patients Card -->
    <div class="card border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div class="card-content p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Unique Patients
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2" v-if="!isFetching">
              {{ summary.unique_patients?.toLocaleString() }}
            </p>
            <div v-else class="animate-pulse bg-gray-200 h-8 w-24 rounded mt-2"></div>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <i class="fas fa-users text-purple-600 text-xl"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-green-500 text-sm font-medium">↗ +15%</span>
          <span class="text-gray-500 text-sm ml-2">dari bulan lalu</span>
        </div>
      </div>
    </div>

  </div>

  <!-- Additional Stats Row -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    
    <!-- Episodes Stats -->
    <div class="card card-hover">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Episode Statistics</h3>
        <div class="bg-blue-50 px-3 py-1 rounded-full">
          <span class="text-blue-600 text-sm font-medium">This Month</span>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="fas fa-file-medical text-blue-600"></i>
            </div>
            <div>
              <p class="font-medium text-gray-900">Unique Episodes</p>
              <p class="text-gray-500 text-sm">Total episodes recorded</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-gray-900" v-if="!isFetching">
              {{ summary.unique_episodes?.toLocaleString() }}
            </p>
            <div v-else class="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i class="fas fa-exchange-alt text-green-600"></i>
            </div>
            <div>
              <p class="font-medium text-gray-900">Total Transactions</p>
              <p class="text-gray-500 text-sm">All recorded transactions</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-gray-900" v-if="!isFetching">
              {{ summary.tx_count?.toLocaleString() }}
            </p>
            <div v-else class="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Card -->
    <div class="card card-hover">
      <h3 class="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
      
      <div class="space-y-3">
        <button class="button is-primary is-fullwidth transition-all duration-200 hover:transform hover:scale-105 shadow-md hover:shadow-lg">
          <span class="icon">
            <i class="fas fa-download"></i>
          </span>
          <span>Export Summary Report</span>
        </button>
        
        <button class="button is-info is-fullwidth transition-all duration-200 hover:transform hover:scale-105 shadow-md hover:shadow-lg">
          <span class="icon">
            <i class="fas fa-chart-bar"></i>
          </span>
          <span>View Detailed Analytics</span>
        </button>
        
        <button class="button is-success is-fullwidth transition-all duration-200 hover:transform hover:scale-105 shadow-md hover:shadow-lg">
          <span class="icon">
            <i class="fas fa-plus"></i>
          </span>
          <span>Add New Entry</span>
        </button>
      </div>
      
      <!-- Progress Indicators -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Monthly Progress</h4>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Revenue Target</span>
              <span class="font-medium">78%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 78%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Patient Target</span>
              <span class="font-medium">92%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full transition-all duration-500" style="width: 92%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
interface SummaryProps {
  summary: {
    total_debit: number
    total_credit: number
    net: number
    unique_patients: number
    unique_episodes: number
    tx_count: number
  }
  isFetching: boolean
}

defineProps<SummaryProps>()

// Format currency helper
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped lang="scss">
// Custom styles can still be added alongside Tailwind
.card {
  // Enhance Bulma card with additional effects
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .card {
    @apply bg-gray-800 text-white;
  }
}
</style>