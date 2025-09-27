import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type DoctorsData = Record<string, any>

export const useDoctorsStore = defineStore('doctors', () => {
  const doctors = ref<Partial<DoctorsData>>()

  const getDoctors = computed(() => doctors.value)

  function setDoctors(newDoctors: Partial<DoctorsData>) {
    doctors.value = newDoctors
  }

  async function destoryDoctors() {
    doctors.value = undefined
  }

  return {
    doctors,
    getDoctors,
    destoryDoctors,
    setDoctors,
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
  import.meta.hot.accept(acceptHMRUpdate(useDoctorsStore, import.meta.hot))
}
