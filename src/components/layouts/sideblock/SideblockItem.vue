<script setup lang="ts">
import type { SideblockItem, SideblockItemAction } from './sideblock.types'
import VCollapseLinksCustom from './VCollapseLinksCustom.vue'

const props = defineProps<{
  link: SideblockItem,
}>()
const emits = defineEmits<{
  toggle: []
}>()
const isOpen = ref(false)
</script>

<template>
  <li v-if="props.link.type === 'link'">
    <VLink :to="props.link.to" class="single-link">
      <span class="icon">
        <VIcon :icon="props.link.icon" />
      </span>
      {{ props.link.label }}
      <span v-if="props.link.badge !== undefined" class="badge">{{ props.link.badge }}</span>
    </VLink>
  </li>
  <component :is="props.link.component" v-else-if="props.link.type === 'component'" :title="props.link.label" />
  <li v-else-if="props.link.type === 'action'">
    <a role="button" tabindex="0" class="single-link" @click="(props.link as SideblockItemAction).onClick"
      @keydown.enter.prevent="(props.link as SideblockItemAction).onClick">
      <span class="icon">
        <VIcon :icon="props.link.icon" />
      </span>
      {{ props.link.label }}
      <span v-if="props.link.badge !== undefined" class="badge">{{ props.link.badge }}</span>
    </a>
  </li>
  <VCollapseLinksCustom v-else-if="props.link.type === 'collapse' && props.link.id === 'dashboard'" 
    :links="props.link.children"
    @toggleDesktopSideblock="emits('toggle')" v-model:isOpen="isOpen">
    <div class="icon">
      <VIcon :icon="props.link.icon" />
    </div>
    {{ props.link.label }}
  </VCollapseLinksCustom>
  <VCollapseLinks v-else-if="props.link.type === 'collapse'" :links="props.link.children"
    @toggleDesktopSideblock="emits('toggle')" v-model:isOpen="isOpen">
    <div class="icon">
      <VIcon :icon="props.link.icon" />
    </div>
    {{ props.link.label }}
  </VCollapseLinks>
  <li v-else-if="props.link.type === 'divider'" class="divider" />
</template>
