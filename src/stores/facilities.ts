import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FacilitiesData = Record<string, any>

export const useFacilitiesStore = defineStore('facilities', () => {
  const facilities = ref<Partial<FacilitiesData>>()

  const getFacilities = computed(() => facilities.value)

  function setFacilities(newFacilities: Partial<FacilitiesData>) {
    facilities.value = newFacilities
  }

  async function destoryFacilities() {
    facilities.value = undefined
  }

  return {
    facilities,
    getFacilities,
    destoryFacilities,
    setFacilities,
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
  import.meta.hot.accept(acceptHMRUpdate(useFacilitiesStore, import.meta.hot))
}
