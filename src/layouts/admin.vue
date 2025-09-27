<script setup lang="ts">
import type { SideblockItem } from '/@src/components/layouts/sideblock/sideblock.types'
import { inject } from 'vue'

// Inject the tab management function
const addTabByPath = inject<(path: string) => void>('addTabByPath')

// Dashboard menu items with their corresponding paths
const dashboardItems = [
  {
    path: '/dashboard/patient',
    label: 'Patient',
    icon: 'lnil lnil-user',
  },
  {
    path: '/dashboard/income',
    label: 'Income', 
    icon: 'lnil lnil-suitcase',
  },
  {
    path: '/dashboard/purchasing',
    label: 'Purchasing',
    icon: 'lnil lnil-dropbox',
  },
  {
    path: '/dashboard/sale',
    label: 'Sale',
    icon: 'lnil lnil-medicine',
  },
  {
    path: '/dashboard/visit',
    label: 'Visit',
    icon: 'lnil lnil-hospital-location',
  },
  {
    path: '/examples/tailwind-priority',
    label: 'Tailwind Priority Example',
    icon: 'lnil lnil-grid-alt',
  },
]

// Function to handle dashboard navigation via tabs
const handleDashboardClick = (path: string) => {
  if (addTabByPath) {
    addTabByPath(path)
  }
}

const links = ref<SideblockItem[]>([
  {
    type: 'collapse',
    label: 'Dashboard',
    id: 'dashboard',
    icon: 'mdi:hospital-building',
    children: dashboardItems.map(item => ({
      to: item.path,
      label: item.label,
      icon: item.icon,
      onClick: () => handleDashboardClick(item.path)
    })),
  },
])
</script>

<template>
  <SideblockLayout
    :links
    class="my-layout"
    theme="curved"
  >
    <!-- Propagating the context to the default slot -->
    <template #default="context">
      <slot v-bind="context" />
    </template>

    <template #logo>
      <RouterLink to="/">
        <AnimatedLogo width="36px" />
      </RouterLink>

      <!-- <h3 class="is-hidden-mobile ml-2">
        RS Baghraf Health Care
      </h3> -->
    </template>

    <template #toolbar>
      <!-- <ToolbarThemeToggle /> -->
      <!-- <ToolbarLanguage /> -->
      <!-- <ToolbarNotification /> -->
      <!-- <ToolbarActivity /> -->
    </template>

    <template #toolbar-mobile>
      <ToolbarNotificationMobile />
      <ToolbarUserProfile />
    </template>

    <template #sideblock-end>
      <ToolbarUserProfile end />
      <!-- <LayoutSwitcher class="search-link" /> -->
      <!-- <ToolbarSearch /> -->
    </template>

    <template #extra>
      <!-- <CircularMenu /> -->

      <PanelLanguages />
      <!-- <PanelActivity /> -->
      <!-- <PanelSearch /> -->
      <!-- <PanelTask /> -->

      <ClientOnly>
        <VReloadPrompt app-name="title" />
      </ClientOnly>
    </template>
  </SideblockLayout>
</template>
