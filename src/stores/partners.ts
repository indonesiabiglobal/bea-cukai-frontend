import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PartnersData = Record<string, any>

export const usePartnersStore = defineStore('partners', () => {
  const partners = ref<Partial<PartnersData>>()

  const getPartners = computed(() => partners.value)

  function setPartners(newPartners: Partial<PartnersData>) {
    partners.value = newPartners
  }

  async function destoryPartners() {
    partners.value = undefined
  }

  return {
    partners,
    getPartners,
    destoryPartners,
    setPartners,
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
  import.meta.hot.accept(acceptHMRUpdate(usePartnersStore, import.meta.hot))
}
