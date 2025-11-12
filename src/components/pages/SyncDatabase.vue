<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

/**
 * Properties
 */
const toast = useToast();
const useApi = useApiFetchV2();

// Sync state
const isSyncing = ref(false);
const syncStatus = ref<'idle' | 'running' | 'error'>('idle');
const syncMessage = ref('');
const syncLog = ref('');
const logFile = ref('');

// Auto-refresh status
let statusInterval: any = null;

/**
 * Run database synchronization
 */
const runSync = async () => {
  isSyncing.value = true;
  syncMessage.value = '';
  
  await useApi.post('sync/run', {}, false)
    .then((res: any) => {
      if (res.data.status === 'running') {
        toast.add({
          severity: 'info',
          summary: 'Sync Running',
          detail: res.data.message || 'Sinkronisasi sedang berjalan.',
          life: 3000,
        });
        syncStatus.value = 'running';
      } else if (res.data.status === 'success') {
        toast.add({
          severity: 'success',
          summary: 'Sync Success',
          detail: res.data.message || 'Sinkronisasi database berhasil.',
          life: 3000,
        });
        syncStatus.value = 'idle';
        // Refresh log after successful sync
        getSyncLog();
      }
      syncMessage.value = res.data.message || '';
      
      // Start polling status if running
      if (syncStatus.value === 'running') {
        startStatusPolling();
      }
    })
    .catch((err: any) => {
      console.error(err);
      toast.add({
        severity: 'error',
        summary: 'Sync Failed',
        detail: err.message || 'Gagal menjalankan sinkronisasi.',
        life: 5000,
      });
      syncStatus.value = 'error';
      syncMessage.value = err.message || 'Gagal menjalankan sinkronisasi.';
    })
    .finally(() => {
      isSyncing.value = false;
    });
};

/**
 * Get current sync status
 */
const getSyncStatus = async () => {
  await useApi.get('sync/status', {}, false)
    .then((res: any) => {
      if (res.data.status === 'running') {
        syncStatus.value = 'running';
        syncMessage.value = res.data.message || 'Sinkronisasi sedang berjalan.';
        
        // Start polling if not already started
        if (!statusInterval) {
          startStatusPolling();
        }
      } else {
        syncStatus.value = 'idle';
        syncMessage.value = res.data.message || 'Tidak ada sinkronisasi yang sedang berjalan.';
        
        // Stop polling if running
        if (statusInterval) {
          stopStatusPolling();
        }
      }
    })
    .catch((err: any) => {
      console.error(err);
      syncStatus.value = 'error';
      syncMessage.value = 'Gagal mengecek status sinkronisasi.';
    });
};

/**
 * Get sync log
 */
const getSyncLog = async () => {
  await useApi.get('sync/log', {}, false)
    .then((res: any) => {
      if (res.data.status === 'success') {
        syncLog.value = res.data.content || '';
        logFile.value = res.data.logFile || '';
      } else {
        syncLog.value = 'Log file tidak ditemukan.';
        logFile.value = '';
      }
    })
    .catch((err: any) => {
      console.error(err);
      syncLog.value = 'Gagal memuat log file.';
      logFile.value = '';
    });
};

/**
 * Start polling sync status
 */
const startStatusPolling = () => {
  if (statusInterval) return;
  
  statusInterval = setInterval(() => {
    getSyncStatus();
    getSyncLog();
  }, 5000); // Poll every 5 seconds
};

/**
 * Stop polling sync status
 */
const stopStatusPolling = () => {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
  }
};

/**
 * Refresh log manually
 */
const refreshLog = () => {
  getSyncLog();
};

// Initialize on mount
onMounted(() => {
  getSyncStatus();
  getSyncLog();
});

// Cleanup on unmount
onUnmounted(() => {
  stopStatusPolling();
});
</script>

<template>
  <div class="sync-database-page">
    <!--Header-->
    <div
      class="dashboard-header bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-3xl p-3 mt-5">
      <div class="flex flex-col lg:justify-between gap-3 w-full">

        <!-- Header Info Section -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Database Synchronization
              </h3>
              <p class="text-gray-600 text-sm font-medium">Sinkronisasi database dari API</p>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status:</span>
            <span v-if="syncStatus === 'idle'"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-300">
              Idle
            </span>
            <span v-else-if="syncStatus === 'running'"
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-300 flex items-center space-x-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <span>Running</span>
            </span>
            <span v-else-if="syncStatus === 'error'"
              class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-300">
              Error
            </span>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="flex flex-wrap gap-3">
          <button @click="runSync" :disabled="isSyncing || syncStatus === 'running'"
            class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                   text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                   transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
              </path>
            </svg>
            <span>Run Sync</span>
          </button>

          <button @click="getSyncStatus"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                   text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                   transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 
                   flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Check Status</span>
          </button>

          <button @click="refreshLog"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                   text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                   transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 
                   flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
              </path>
            </svg>
            <span>Refresh Log</span>
          </button>
        </div>

        <!-- Status Message -->
        <div v-if="syncMessage" class="mt-2 p-3 rounded-xl border" :class="{
          'bg-blue-50 border-blue-200 text-blue-800': syncStatus === 'running',
          'bg-gray-50 border-gray-200 text-gray-800': syncStatus === 'idle',
          'bg-red-50 border-red-200 text-red-800': syncStatus === 'error'
        }">
          <p class="text-sm font-medium">{{ syncMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Log Viewer -->
    <div class="log-viewer-container mt-6">
      <div
        class="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-3xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold text-gray-900">Sync Log</h4>
          <span v-if="logFile" class="text-xs text-gray-600 font-mono">{{ logFile }}</span>
        </div>

        <div class="log-content bg-gray-900 rounded-xl p-4 overflow-auto max-h-96 border border-gray-700">
          <pre v-if="syncLog"
            class="text-xs text-green-400 font-mono whitespace-pre-wrap">{{ syncLog }}</pre>
          <p v-else class="text-sm text-gray-500 italic">No log available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '/@src/scss/abstracts/all';

.sync-database-page {
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

  .log-viewer-container {
    .log-content {
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }
}

@media only screen and (width <=767px) {
  .sync-database-page {
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
}

/* Dark mode support */
.is-dark {
  .sync-database-page {
    .dashboard-header {
      background: var(--dark-sidebar-light-5);
      border-color: var(--dark-sidebar-light-12);
    }

    .log-viewer-container {
      .log-content {
        background: var(--dark-sidebar-light-2);
        border-color: var(--dark-sidebar-light-12);
      }
    }
  }
}
</style>
