import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ModuleAppData = Record<string, any>

export const useModuleAppSession = defineStore('moduleApp', () => {
  const moduleApp = ref<Partial<ModuleAppData>>()

  const getModuleApp = computed(() => moduleApp.value)

  function setModuleApp(newModuleApp: Partial<ModuleAppData>) {
    moduleApp.value = newModuleApp
  }

  async function destoryModuleApp() {
    moduleApp.value = undefined
  }

  return {
    moduleApp,
    getModuleApp,
    destoryModuleApp,
    setModuleApp,
  } as const
})

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModuleAppSession, import.meta.hot))
}
