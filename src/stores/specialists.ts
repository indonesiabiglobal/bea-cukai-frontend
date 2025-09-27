import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SpecialistsData = Record<string, any>

export const useSpecialistsStore = defineStore('specialists', () => {
  const specialists = ref<Partial<SpecialistsData>>()

  const getSpecialists = computed(() => specialists.value)

  function setSpecialists(newSpecialists: Partial<SpecialistsData>) {
    specialists.value = newSpecialists
  }

  async function destorySpecialists() {
    specialists.value = undefined
  }

  return {
    specialists,
    getSpecialists,
    destorySpecialists,
    setSpecialists,
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
  import.meta.hot.accept(acceptHMRUpdate(useSpecialistsStore, import.meta.hot))
}
