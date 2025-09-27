import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ProgramsData = Record<string, any>

export const useProgramsStore = defineStore('programs', () => {
  const programs = ref<Partial<ProgramsData>>()

  const getPrograms = computed(() => programs.value)

  function setPrograms(newPrograms: Partial<ProgramsData>) {
    programs.value = newPrograms
  }

  async function destroyPrograms() {
    programs.value = undefined
  }

  return {
    programs,
    getPrograms,
    destroyPrograms,
    setPrograms,
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
  import.meta.hot.accept(acceptHMRUpdate(useProgramsStore, import.meta.hot))
}
