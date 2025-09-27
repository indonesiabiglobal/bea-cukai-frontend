import { createApp as createClientApp, createSSRApp } from 'vue'

import type { H3Event } from 'h3'
import { createHead } from '@unhead/vue'
import { InferSeoMetaPlugin } from '@unhead/addons'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'

import type { VueroPlugin, VueroAppContext } from '/@src/utils/plugins'
import { createRouter } from '/@src/router'
import VueroApp from '/@src/VueroApp.vue'
import '/@src/styles'

// Library imports
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import ConfirmationService from 'primevue/confirmationservice'

const plugins = import.meta.glob<{ default?: VueroPlugin }>('./plugins/*.ts', {
  eager: true,
})

export async function createApp(event?: H3Event) {
  const app = __VUERO_SSR_BUILD__
    ? createSSRApp(VueroApp)
    : createClientApp(VueroApp)

  const router = createRouter()

  const head = createHead({
    plugins: [InferSeoMetaPlugin()],
  })
  app.use(head)
  app.use(ToastService)

  // Library usage
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.is-dark',
      },
    },
  })
  app.use(ConfirmationService)
  app.use(ToastService)

  const pinia = createPinia()

  // restore pinia state from SSR if any, before loading plugins
  if (__VUERO_SSR_BUILD__ && !import.meta.env.SSR) {
    const initialState = window.__vuero__
    if (typeof initialState?.pinia === 'object') {
      pinia.state.value = { ...initialState.pinia }
    }
  }

  app.use(pinia)

  const vuero: VueroAppContext = {
    app,
    router,
    head,
    pinia,
    event,
  }

  app.component('Toast', Toast)

  for (const path in plugins) {
    try {
      const plugin = plugins[path]?.default
      if (!plugin) throw new Error(`Plugin does not have a default export.`)
      await plugin(vuero)
    }
    catch (error) {
      console.log(`Error while loading plugin "${path}"`)
      console.error(error)
    }
  }

  // use router after plugin registration, so we can register navigation guards in plugins
  app.use(vuero.router)

  return vuero
}
