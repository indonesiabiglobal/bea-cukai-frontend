import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FirebaseToken = string

export const useFirebaseToken = defineStore('firebaseToken', () => {
  const token = ref<Partial<FirebaseToken>>()

  const isLoggedIn = computed(() => token.value !== undefined)

  function setToken(newToken: Partial<FirebaseToken>) {
    token.value = newToken
  }

  async function logoutToken() {
    token.value = undefined
  }

  return {
    token,
    isLoggedIn,
    logoutToken,
    setToken,
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
  import.meta.hot.accept(acceptHMRUpdate(useFirebaseToken, import.meta.hot))
}
