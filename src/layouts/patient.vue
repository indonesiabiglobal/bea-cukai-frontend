<script setup lang="ts">
import type { SideblockItem } from '/@src/components/layouts/sideblock/sideblock.types'

import config from '/@src/config.ts';

const title = config.site_title;

const links = ref<SideblockItem[]>([
  {
    type: 'link',
    label: 'Dashboard',
    icon: 'material-symbols:dashboard-2-outline',
    to: '/patients',
  },
  {
    type: 'link',
    label: 'Doctor',
    icon: 'lnil lnil-sthethoscope',
    to: '/patients/doctors',
  },
  {
    type: 'link',
    label: 'History Appointment',
    icon: 'lnil lnil-calender-alt-2',
    to: '/patients/appointments/history',
  },
  // {
  //   type: 'collapse',
  //   label: 'Appointment',
  //   id: 'appointment',
  //   icon: 'mdi:hospital-building',
  //   children: [
  //     {
  //       to: '/patients/appointment/create',
  //       label: 'Make a Appointment',
  //       icon: 'lnil lnil-hospital-alt-3',
  //     },
  //     {
  //       to: '/patients/appointment/history',
  //       label: 'History',
  //       icon: 'lnil lnil-calender-alt-2',
  //     },
  //   ],
  // },
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
      <!-- <ToolbarThemeToggle />
      <ToolbarLanguage />
      <ToolbarNotification />
      <ToolbarActivity /> -->
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

      <!-- <PanelLanguages /> -->
      <!-- <PanelActivity /> -->
      <!-- <PanelSearch /> -->
      <!-- <PanelTask /> -->

      <ClientOnly>
        <VReloadPrompt app-name="title" />
      </ClientOnly>
    </template>
  </SideblockLayout>
</template>
