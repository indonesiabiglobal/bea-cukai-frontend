<script setup lang="ts">
import type { NavbarItem } from '/@src/components/layouts/navbar/navbar.types'

const pageTitle = useVueroContext<string>('page-title')

const moduleAppSession = useModuleAppSession()
const moduleApp = ref(moduleAppSession.moduleApp)

const links = computed<NavbarItem[]>(() => [
  {
    type: 'megamenu',
    label: 'Modules',
    id: 'modules',
    icon: 'lucide:activity',

    children: Array.isArray(moduleApp.value) ? moduleApp.value : [],
  },
])

const modelValue = ref<string>('')

const search = (query: string) => {
  modelValue.value = query

  if (query === '') {
    moduleApp.value = moduleAppSession.moduleApp ?? []
    return
  }

  if (moduleAppSession.moduleApp) {
    moduleApp.value = moduleAppSession.moduleApp?.map((module: any) => {
      // Pastikan `module.children` ada dan filter sesuai dengan query
      const filteredChildren = module.children.filter((child: any) => {
        return child.label.toLowerCase().includes(query.toLowerCase())
      })

      // Return module dengan children yang difilter
      return { ...module, children: filteredChildren }
    }) ?? []
  } else {
    moduleApp.value = [] // Jika tidak ada moduleAppSession.moduleApp
  }

}
</script>

<template>
  <NavbarLayout size="large" :links>
    <!-- Propagating the context to the default slot -->
    <template #default="context">
      <slot v-bind="context" />
    </template>

    <template #logo>
      <RouterLink to="/">
        <AnimatedLogo width="75px" height="38px" />
      </RouterLink>
    </template>

    <template #navbar-title>
      <!-- <ProjectsQuickDropdown /> -->
      <VAvatar size="small" :color="'h-blue'" :initials="pageTitle?.slice(0, 1)" tabindex="0" />
      <h1 class="title is-6 ms-2">
        {{ pageTitle }}
      </h1>
    </template>

    <template #title-mobile>
      <div class="is-flex is-align-items-center">
        <!-- <ProjectsQuickDropdown /> -->
        <VAvatar size="small" :color="'h-blue'" :initials="pageTitle?.slice(0, 1)" tabindex="0" />
        <h1 class="title is-4">
          {{ pageTitle }}
        </h1>
      </div>
    </template>

    <template #toolbar>
      <LayoutSwitcher class="is-hidden-mobile" />
      <ToolbarNotification />
      <ToolbarActivity />
      <ToolbarThemeToggle />
      <ToolbarLanguage />
      <ToolbarUserProfile right class="ml-2 is-hidden-mobile" />
    </template>

    <template #toolbar-mobile>
      <ToolbarNotificationMobile />
      <ToolbarUserProfile right />
    </template>

    <template #megamenu-start>
      <SearchHistory />
    </template>
    <template #megamenu-top>
      <NavsearchInput class="mt-4 mb-2" @search="search" />
    </template>

    <template #extra>
      <PanelLanguages />
      <PanelActivity />
      <PanelSearch />
      <PanelTask />

      <ClientOnly>
        <VReloadPrompt app-name="Vuero" />
      </ClientOnly>
    </template>
  </NavbarLayout>
</template>
