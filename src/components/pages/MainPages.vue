<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import DashboardTabs from '/@src/components/dashboard/DashboardTabs.vue'

// Ref untuk akses ke komponen DashboardTabs
const dashboardTabsRef = ref<any>(null)

// Inject the global tab manager registration function
const registerTabManager = inject<(callback: (path: string) => void) => void>('registerTabManager')

// Function untuk menambah tab - akan dipanggil dari global manager
const addTabByPath = (path: string) => {
  if (dashboardTabsRef.value) {
    dashboardTabsRef.value.addTabByPath(path)
  }
}

// Register this component with the global tab manager
onMounted(() => {
  if (registerTabManager) {
    registerTabManager(addTabByPath)
  }
})
</script>

<template>
  <div class="h-full">
    <DashboardTabs ref="dashboardTabsRef" />
  </div>
</template>