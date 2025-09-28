<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

interface DashboardLinkItem {
  label: string
  to: string
  icon?: string
  tag?: string | number
  onClick?: () => void
}

const props = defineProps<{
  links: DashboardLinkItem[]
}>()

const route = useRoute()
const isOpen = defineModel<boolean>('isOpen')

onMounted(() => {
  if (props.links.some(link => withoutTrailingSlash(link.to) === withoutTrailingSlash(route.path))) {
    isOpen.value = true
  }
})

function toggle() {
  isOpen.value = !isOpen.value
}

// Handle dashboard link click
const handleLinkClick = (link: DashboardLinkItem, event: Event) => {
  event.preventDefault()
  if (link.onClick) {
    link.onClick()
  }
}
</script>

<template>
  <li class="collapse-links has-children" :class="[isOpen && 'active']">
    <div class="collapse-wrap">
      <a role="button" tabindex="0" class="parent-link" @click.prevent="() => toggle()"
        @keydown.enter.prevent="() => toggle()">
        <slot />
        <VIcon class="rtl-hidden" icon="lucide:chevron-right" />
        <VIcon class="ltr-hidden" icon="lucide:chevron-left" />
      </a>
    </div>
    <Transition name="collapse-links-transition" mode="out-in">
      <ul v-if="isOpen" class="collapse-content">
        <li v-for="child of props.links" :key="child.to">
          <a 
            class="is-submenu"
            href="#"
            @click="handleLinkClick(child, $event)"
            @keydown.enter.prevent="handleLinkClick(child, $event)"
          >
            <VIcon v-if="child.icon" :icon="child.icon" />
            <span>{{ child.label }}</span>
            <VTag v-if="child.tag" :label="child.tag" color="primary" outlined curved />
          </a>
        </li>
      </ul>
    </Transition>
  </li>
</template>

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

.is-submenu {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  text-decoration: none;
  color: var(--light-text);
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 8px;
  
  &:hover {
    background: var(--fade-grey-light-2);
    color: var(--primary);
    transform: translateX(4px);
  }
  
  .iconify {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }
  
  span {
    flex: 1;
  }
}

.is-dark {
  .is-submenu {
    color: var(--light-text);
    
    &:hover {
      background: var(--dark-sidebar-light-2);
      color: var(--primary);
    }
  }
}
</style>