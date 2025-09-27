<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

const props = defineProps<{
  isDesktopSideblockOpen: boolean
  links: {
    label: string
    to: string
    icon?: string
    tag?: string | number
  }[]
}>()

const route = useRoute()
const isOpen = defineModel<boolean>('isOpen')
const emits = defineEmits<{
  toggleDesktopSideblock: []
}>()

onMounted(() => {
  if (props.links.some(link => withoutTrailingSlash(link.to) === withoutTrailingSlash(route.path))) {
    isOpen.value = true
  }
})

const handleToggle = () => {
  emits('toggleDesktopSideblock');
};
</script>

<template>
  <li class="collapse-links has-children" :class="[isOpen && 'active-link-inactive']">
    <div class="collapse-wrap">
      <a role="button" tabindex="0" class="parent-link inactive" @click.prevent="() => handleToggle()"
        @keydown.enter.prevent="() => handleToggle()">
        <slot />
        <VIcon class="rtl-hidden" icon="lucide:chevron-right" />
        <VIcon class="ltr-hidden" icon="lucide:chevron-left" />
      </a>
    </div>
  </li>
</template>

<style lang="scss">
.sidebar-block .sidebar-block-inner li.has-children.active-link-inactive .collapse-wrap>a .icon {
  color: var(--primary);
}
</style>

<style lang="scss" scoped>
.collapse-links {
  overflow: hidden;
  user-select: none;
}

.collapse-links-transition-enter-active,
.collapse-links-transition-leave-active {
  opacity: 1;
  transform: translateY(0) scaleY(1);
  transform-origin: center top;
}

.collapse-links-transition-enter-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.1s ease-in;
}

.collapse-links-transition-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.1s ease-out;
}

.collapse-links-transition-enter-from,
.collapse-links-transition-leave-to {
  transform: translateY(-10px) scaleY(0.2);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {

  .collapse-links-transition-enter-active,
  .collapse-links-transition-leave-active {
    transition: none;
  }
}
</style>
