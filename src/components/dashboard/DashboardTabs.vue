<script setup lang="ts">
import { availableMenus, type MenuItem } from '../../data/apps/menu'
import { SideblockItem } from '../layouts/sideblock/sideblock.types'

interface TabItem {
  id: string
  label: string
  icon: string
  component: any
  path: string
}

// Reactive state (using shallowRef for tabs to prevent deep reactivity on components)
const activeTab = ref('home')
const showAddMenu = ref(false)
const tabs = ref<TabItem[]>([])

// Methods
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
  showAddMenu.value = false
}

const addTab = (menuItem: MenuItem) => {
  // Check if tab already exists
  const existingTab = tabs.value.find(tab => tab.path === menuItem.path)

  if (existingTab) {
    // Switch to existing tab
    activeTab.value = existingTab.id
  } else {
    // Create new tab
    const newTab: TabItem = {
      id: `tab-${Date.now()}`,
      label: menuItem.label,
      icon: menuItem.icon,
      component: menuItem.component,
      path: menuItem.path
    }

    tabs.value.push(newTab)
    activeTab.value = newTab.id
  }

  showAddMenu.value = false
}

// Function to add tab by path (for sidebar navigation)
const addTabByPath = (path: string) => {
  const menuItem = availableMenus.find(menu => menu.path === path)
  if (menuItem) {
    addTab(menuItem)
  }
}

// Provide the addTabByPath function to child components
provide('addTabByPath', addTabByPath)

// Expose addTabByPath method to parent component
defineExpose({
  addTabByPath
})

const closeTab = (tabId: string) => {
  const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
  if (tabIndex !== -1) {
    // Check if the tab being closed is the currently active tab
    const isClosingActiveTab = activeTab.value === tabId

    // Remove the tab from the array
    tabs.value.splice(tabIndex, 1)

    // Only change activeTab if we're closing the currently active tab
    if (isClosingActiveTab) {
      if (tabs.value.length > 0) {
        // Switch to the previous tab or first available tab
        const newActiveIndex = Math.max(0, tabIndex - 1)
        activeTab.value = tabs.value[newActiveIndex]?.id || 'home'
      } else {
        // No tabs left, go to home
        activeTab.value = 'home'
      }
    }
  }
}

// Close add menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.add-tab-btn') && !target.closest('.add-menu')) {
    showAddMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+T to open add menu
  if (event.ctrlKey && event.key === 't') {
    event.preventDefault()
    showAddMenu.value = !showAddMenu.value
  }

  // Ctrl+W to close current tab
  if (event.ctrlKey && event.key === 'w') {
    event.preventDefault()
    if (activeTab.value !== 'home') {
      closeTab(activeTab.value)
    }
  }

  // Ctrl+Tab to switch between tabs
  if (event.ctrlKey && event.key === 'Tab') {
    event.preventDefault()
    const allTabs = ['home', ...tabs.value.map(t => t.id)]
    const currentIndex = allTabs.indexOf(activeTab.value)
    const nextIndex = (currentIndex + 1) % allTabs.length
    activeTab.value = allTabs[nextIndex]
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})


const userSession = useUserSession()
const filteredLinks = ref<MenuItem[]>([]);
onMounted(() => {
  if (availableMenus) {
    if (userSession?.user?.level !== 'admin') {
      // Filter links based on user level
      filteredLinks.value = availableMenus.filter(link => {
        // Example filtering logic, adjust as needed
        if (link.groupMenu === 'Sync Database' || link.groupMenu === 'User Log') {
          return false;
        }
        return true;
      });
    } else {
      filteredLinks.value = availableMenus;
    }
  }
})
</script>

<template>
  <div class="dashboard-tabs-container">

    <!-- Tab Bar -->
    <div class="tabs-bar bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center overflow-x-auto scrollbar-hide">

        <!-- Home Tab (Always visible) -->
        <div class="tab-item home-tab" :class="{ 'active': activeTab === 'home' }" @click="setActiveTab('home')">
          <div class="flex items-center space-x-2 px-4 py-3">
            <i class="fas fa-home text-sm"></i>
            <span class="text-sm font-medium">Home</span>
          </div>
        </div>

        <!-- Dynamic Tabs -->
        <div v-for="tab in tabs" :key="tab.id" class="tab-item" :class="{ 'active': activeTab === tab.id }"
          @click="setActiveTab(tab.id)">
          <div class="flex items-center space-x-2 px-4 py-3">
            <i :class="tab.icon" class="text-sm"></i>
            <span class="text-sm font-medium">{{ tab.label }}</span>
            <button @click.stop="closeTab(tab.id)"
              class="close-btn ml-2 hover:bg-red-100 rounded-full p-1 transition-all duration-200" title="Close tab">
              <i class="fas fa-times text-xs text-gray-400 hover:text-red-500 transition-colors"></i>
            </button>
          </div>
        </div>

        <!-- Add Tab Button -->
        <div class="add-tab-btn" @click="showAddMenu = !showAddMenu">
          <div class="flex items-center justify-center w-10 h-10">
            <i class="fas fa-plus text-gray-400 hover:text-gray-600 text-sm"></i>
          </div>
        </div>

      </div>

      <!-- Add Tab Dropdown Menu -->
      <div v-if="showAddMenu"
        class="add-menu absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
        <div class="py-2">
          <div v-for="menuItem in filteredLinks" :key="menuItem.path" @click="addTab(menuItem)"
            class="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
            <i :class="menuItem.icon" class="text-sm text-gray-600"></i>
            <span class="text-sm text-gray-700">{{ menuItem.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex-1 overflow-y-auto">

      <!-- Home Content -->
      <div v-if="activeTab === 'home'" class="h-full overflow-y-auto">
        <div class="mx-auto px-1 py-8">

          <!-- Welcome Header -->
          <div class="bg-white rounded-xl p-8 text-gray-800 mb-8">
            <!-- icon pabrik -->

            <h1 class="text-3xl font-bold mb-2">🏭 Selamat Datang di Fukusuke Kogyo Indonesia</h1>
            <p class="text-lg opacity-90">Pilih report dari menu untuk memulai</p>
          </div>

          <!-- Quick Access Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div v-for="menu in filteredLinks" :key="menu.path" @click="addTab(menu)"
              class="card hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div class="card-content p-6">
                <div class="flex items-center space-x-4 mb-4">
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                    :class="menu.bgColor">
                    <i :class="menu.icon" class="text-xl text-white"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ menu.label }}</h3>
                    <p class="text-sm text-gray-500">{{ menu.description }}</p>
                  </div>
                </div>
                <div class="flex items-center text-blue-600 text-sm font-medium">
                  <span>Open Menu</span>
                  <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dynamic Tab Contents -->
      <div v-for="tab in tabs" :key="tab.id" v-show="activeTab === tab.id" class="h-full overflow-auto">
        <component :is="tab.component" />
      </div>

    </div>

  </div>
</template>

<style scoped lang="scss">
.dashboard-tabs-container {
  height: 88vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.tabs-bar {
  position: sticky;
  top: 16px;
  z-index: 100;
  flex-shrink: 0;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px;

  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.tab-item {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid #e2e8f0;
  white-space: nowrap;
  animation: slideInTab 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }

  &.active {
    background: white;
    border-bottom: 2px solid #3b82f6;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #3b82f6;
    }
  }
}

.close-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: rgba(239, 68, 68, 0.1);

    i {
      color: #ef4444;
    }
  }
}

.add-tab-btn {
  cursor: pointer;
  border-left: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
}

.add-menu {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInTab {
  from {
    opacity: 0;
    transform: translateX(-20px);
    max-width: 0;
  }

  to {
    opacity: 1;
    transform: translateX(0);
    max-width: 200px;
  }
}

.tab-content {
  flex: 1;
  overflow: hidden;
  min-height: 95vh;
}

// Dark mode support
.is-dark {
  .tabs-bar {
    background: var(--dark-sidebar);
    border-color: var(--dark-sidebar-light-6);
  }

  .tab-item {
    border-color: var(--dark-sidebar-light-6);

    &:hover {
      background: var(--dark-sidebar-light-2);
    }

    &.active {
      background: var(--dark-sidebar-light-6);
      color: var(--primary);
    }
  }

  .add-menu {
    background: var(--dark-sidebar);
    border-color: var(--dark-sidebar-light-6);
  }
}

// Responsive design
@media (max-width: 768px) {
  .tab-item {
    .text-sm {
      display: none;
    }
  }

  .add-menu {
    right: 1rem;
    min-width: 200px;
  }
}
</style>