import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ShiftData = Record<string, any>

export const useShiftCombo = defineStore('shiftCombo', () => {
  const shiftCombo = ref<Partial<ShiftData>>()

  const getShiftCombo = computed(() => shiftCombo.value)

  function setShiftCombo(newShiftCombo: Partial<ShiftData>) {
    shiftCombo.value = newShiftCombo
  }

  async function destoryShiftCombo() {
    shiftCombo.value = undefined
  }

  return {
    shiftCombo,
    getShiftCombo,
    destoryShiftCombo,
    setShiftCombo,
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
  import.meta.hot.accept(acceptHMRUpdate(useShiftCombo, import.meta.hot))
}
