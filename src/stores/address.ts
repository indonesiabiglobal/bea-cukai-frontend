import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type AddressData = Record<string, any>

export const useAddressStore = defineStore('address', () => {
  const address = ref<Partial<AddressData>>()

  const getAddress = computed(() => address.value)

  function setAddress(newAddress: Partial<AddressData>) {
    address.value = newAddress
  }

  async function destoryAddress() {
    address.value = undefined
  }

  return {
    address,
    getAddress,
    destoryAddress,
    setAddress,
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
  import.meta.hot.accept(acceptHMRUpdate(useAddressStore, import.meta.hot))
}
