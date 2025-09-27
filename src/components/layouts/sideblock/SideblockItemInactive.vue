<script setup lang="ts">
import type { SideblockItem, SideblockItemAction } from './sideblock.types'

const props = defineProps<{
  link: SideblockItem,
  isDesktopSideblockOpen: boolean
}>()
const emits = defineEmits<{
  toggleDesktopSideblock: []
}>()
const isOpen = ref(false)

</script>

<template>
  <li v-if="props.link.type === 'link'">
    <VLink :to="props.link.to" class="single-link inactive">
      <span class="icon">
        <VIcon :icon="props.link.icon" />
      </span>
      <!-- {{ props.link.label }} -->
      <!-- <span v-if="props.link.badge !== undefined" class="badge">{{ props.link.badge }}</span> -->
    </VLink>
  </li>
  <component :is="props.link.component" v-else-if="props.link.type === 'component'" />
  <li v-else-if="props.link.type === 'action'">
    <a role="button" tabindex="0" class="single-link Inactive" @click="(props.link as SideblockItemAction).onClick"
      @keydown.enter.prevent="(props.link as SideblockItemAction).onClick">
      <span class="icon">
        <VIcon :icon="props.link.icon" />
      </span>
      <!-- {{ props.link.label }} -->
      <!-- <span v-if="props.link.badge !== undefined" class="badge">{{ props.link.badge }}</span> -->
    </a>
  </li>
  <VCollapseLinksInactive v-else-if="props.link.type === 'collapse'" :links="props.link.children" isDesktopSideblockOpen
    @toggleDesktopSideblock="emits('toggleDesktopSideblock')" v-model:isOpen="isOpen">
    <div class="icon">
      <VIcon :icon="props.link.icon" />
    </div>
    <!-- {{ props.link.label }} -->
  </VCollapseLinksInactive>
  <li v-else-if="props.link.type === 'divider'" class="divider" />
</template>
