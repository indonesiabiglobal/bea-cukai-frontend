import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ArticlesData = Record<string, any>

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Partial<ArticlesData>>()

  const getArticles = computed(() => articles.value)

  function setArticles(newArticles: Partial<ArticlesData>) {
    articles.value = newArticles
  }

  async function destoryArticles() {
    articles.value = undefined
  }

  return {
    articles,
    getArticles,
    destoryArticles,
    setArticles,
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
  import.meta.hot.accept(acceptHMRUpdate(useArticlesStore, import.meta.hot))
}
