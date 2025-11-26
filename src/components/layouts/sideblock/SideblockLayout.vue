<script setup lang="ts">
import type { SideblockLayoutContext, SideblockItem, SideblockTheme } from './sideblock.types'
import { injectionKey } from './sideblock.context'
import SideblockItemMobile from './SideblockItemMobile.vue'

const props = withDefaults(
  defineProps<{
    links?: SideblockItem[]
    theme?: SideblockTheme
    size?: 'default' | 'large' | 'wide' | 'full'
    closeOnChange?: boolean
    openOnMounted?: boolean
  }>(),
  {
    links: () => [],
    theme: 'default',
    size: 'default',
  },
)

const pageTitle = useVueroContext<string>('page-title')
const route = useRoute()

const isMobileSideblockOpen = ref(false)
const isDesktopSideblockOpen = ref(props.openOnMounted)

// provide context to children
const context: SideblockLayoutContext = {
  links: computed(() => props.links),
  theme: computed(() => props.theme),
  closeOnChange: computed(() => props.closeOnChange),
  openOnMounted: computed(() => props.openOnMounted),

  isMobileSideblockOpen,
  isDesktopSideblockOpen,
}
provide(injectionKey, context)

// using reactive context for slots, has better dev experience
const contextRx = reactive(context)

// const isOpen = ref(false)

const changeSideblockState = () => {
  isDesktopSideblockOpen.value = !isDesktopSideblockOpen.value
}

watch(
  () => route.fullPath,
  () => {
    isMobileSideblockOpen.value = false

    if (props.closeOnChange && isDesktopSideblockOpen.value) {
      isDesktopSideblockOpen.value = false
    }
  },
)

const userSession = useUserSession()
const filteredLinks = ref<SideblockItem[]>([]);
onMounted(() => {
  if (props.links) {
    if (userSession?.user?.level !== 'admin') {
      // Filter links based on user level
      filteredLinks.value = props.links.filter(link => {
        // Example filtering logic, adjust as needed
        if (link.id === 'sync-database' || link.id === 'user-log-transaction-report') {
          return false;
        }
        return true;
      });
    } else {
      filteredLinks.value = props.links;
    }
  }
})
</script>

<template>
  <div class="sidebar-layout">
    <!-- Mobile navigation -->
    <MobileNavbar v-model="isMobileSideblockOpen">
      <template #logo>
        <slot name="logo" v-bind="contextRx" />

        <div class="brand-end">
          <slot name="toolbar-mobile" v-bind="contextRx" />
        </div>
      </template>
    </MobileNavbar>

    <Transition name="slide-x">
      <SideblockSubsidebarMobile v-if="isMobileSideblockOpen" :items="filteredLinks">
        <template #default>
          <slot name="sideblock-title-mobile" />
        </template>
        <template #links>
          <slot name="sideblock-links-mobile" v-bind="contextRx">
            <SideblockItemMobile v-for="(link, key) in filteredLinks" :key :link />
          </slot>
        </template>
      </SideblockSubsidebarMobile>
    </Transition>
    <Transition name="fade">
      <MobileOverlay v-if="isMobileSideblockOpen" @click="isMobileSideblockOpen = false" />
    </Transition>
    <!-- /Mobile navigation -->

    <!-- Desktop navigation -->
    <Transition name="slide-x">
      <Sideblock :isActive="isDesktopSideblockOpen" :theme="props.theme">
        <template #header>
          <slot name="logo" v-bind="contextRx" />

          <div class="vuero-hamburger nav-trigger push-resize ml-2" tabindex="0" role="button"
            @keydown.enter.prevent="changeSideblockState" @click="changeSideblockState">
            <span class="menu-toggle has-chevron">
              <span :class="[isDesktopSideblockOpen && 'active']" class="icon-box-toggle">
                <span class="rotate">
                  <i aria-hidden="true" class="icon-line-top" />
                  <i aria-hidden="true" class="icon-line-center" />
                  <i aria-hidden="true" class="icon-line-bottom" />
                </span>
              </span>
            </span>
          </div>
        </template>
        <template #links>
          <slot name="sideblock-links" v-bind="contextRx">
            <SideblockItem v-if="isDesktopSideblockOpen" v-for="(link, key) in filteredLinks" :key :link
              @toggle="isDesktopSideblockOpen = !isDesktopSideblockOpen" />
            <SideblockItemInactive v-else v-for="(link, key) in filteredLinks" :class="'sidebar-block-inactive'" :key
              :link :isDesktopSideblockOpen="isDesktopSideblockOpen"
              @toggleDesktopSideblock="isDesktopSideblockOpen = !isDesktopSideblockOpen" />
          </slot>
        </template>

        <template #links-bottom>
          <slot name="sideblock-end" v-bind="contextRx" />
        </template>
      </Sideblock>
    </Transition>
    <!-- /Desktop navigation -->

    <ViewWrapper full :class="[
      isDesktopSideblockOpen && 'is-pushed-block',
    ]">
      <template v-if="props.size === 'full'">
        <slot name="page-heading" v-bind="contextRx">
          <SideblockPageHeading :open="isDesktopSideblockOpen"
            @toggle="isDesktopSideblockOpen = !isDesktopSideblockOpen">
            {{ pageTitle }}

            <template #toolbar>
              <slot name="toolbar" v-bind="contextRx" />
            </template>
          </SideblockPageHeading>
        </slot>

        <slot v-bind="contextRx" />
      </template>
      <PageContentWrapper v-else :size="props.size">
        <PageContent class="is-relative">
          <slot name="page-heading" v-bind="contextRx">
            <!-- <SideblockPageHeading :open="isDesktopSideblockOpen"
              @toggle="isDesktopSideblockOpen = !isDesktopSideblockOpen">
              {{ pageTitle }}

              <template #toolbar>
                <slot name="toolbar" v-bind="contextRx" />
              </template>
            </SideblockPageHeading> -->
          </slot>

          <slot v-bind="contextRx" />
        </PageContent>
      </PageContentWrapper>
    </ViewWrapper>

    <slot name="extra" />
  </div>
</template>
