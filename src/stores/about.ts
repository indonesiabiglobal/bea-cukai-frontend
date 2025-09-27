import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type AboutData = Record<string, any>

export const useAboutStore = defineStore('about', () => {
  const about = ref<Partial<AboutData>>()

  const getAbout = computed(() => about.value)

  function setAbout(newAbout: Partial<AboutData>) {
    about.value = newAbout
  }

  async function destroyAbout() {
    about.value = undefined
  }

  return {
    about,
    getAbout,
    destroyAbout,
    setAbout,
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
  import.meta.hot.accept(acceptHMRUpdate(useAboutStore, import.meta.hot))
}
