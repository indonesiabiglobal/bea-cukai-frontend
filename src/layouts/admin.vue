<script setup lang="ts">
import { availableMenus } from '../data/apps/menu'
import type { SideblockItem } from '/@src/components/layouts/sideblock/sideblock.types'
import { inject, ref } from 'vue'

// Inject the tab management function
const addTabByPath = inject<(path: string) => void>('addTabByPath')

const reportItems = availableMenus.filter(menu => menu.groupMenu === 'Report')
const dataMasterItems = availableMenus.filter(menu => menu.groupMenu === 'Data Master')
const auxiliaryMaterialsItems = availableMenus.filter(menu => menu.groupMenu === 'Auxiliary Materials')

// Function to handle navigation via tabs
const handleDashboardClick = (path: string) => {
  if (addTabByPath) {
    addTabByPath(path)
  }
}

const userSession = useUserSession()
const router = useRouter()
const useApi = useApiFetchV2()
const token = useUserToken()
const route = useRoute();
const toaster = useToaster()

const logout = async () => {
  try {
    await useApi.post('auth/logout', token.value).then(() => {
      userSession.logoutUser();
      router.push('/auth/login');
    }).catch((error) => {
      console.error('Error during logout API call:', error);
      toaster.error('Logout failed. Please try again.');
    });
  } catch (error) {
    toaster.error('Failed to logout');
  }
};
const links = ref<SideblockItem[]>([
  {
    type: 'collapse',
    label: 'Data Master',
    id: 'data-master',
    group: 'tab',
    icon: 'mdi:database',
    children: dataMasterItems.map(item => ({
      to: item.path,
      label: item.label,
      icon: item.icon,
      onClick: () => handleDashboardClick(item.path)
    })),
  },
  {
    type: 'collapse',
    label: 'Laporan',
    id: 'report',
    group: 'tab',
    icon: 'mdi:hospital-building',
    children: reportItems.map(item => ({
      to: item.path,
      label: item.label,
      icon: item.icon,
      onClick: () => handleDashboardClick(item.path)
    })),
  },
  {
    type: 'collapse',
    label: 'Bahan Penolong',
    id: 'auxiliary-materials',
    group: 'tab',
    icon: 'mdi:folder',
    children: auxiliaryMaterialsItems.map(item => ({
      to: item.path,
      label: item.label,
      icon: item.icon,
      onClick: () => handleDashboardClick(item.path)
    })),
  },
  // logout
  {
    type: 'action',
    label: 'Logout',
    id: 'logout',
    icon: 'mdi:logout',
    onClick: () => logout()
  }
])
</script>

<template>
  <SideblockLayout :links class="my-layout" theme="curved">
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
