import { definePlugin } from '/@src/utils/plugins'

/**
 * Here we are setting up two router navigation guards
 * (note that we can have multiple guards in multiple plugins)
 *
 * We can add meta to pages either by declaring them manualy in the
 * routes declaration (see /@src/router.ts)
 * or by adding a <route> tag into .vue files (see /@src/pages/sidebar/dashboards.ts)
 *
 * <script setup lang="ts">
 * definePage({
 *   meta: {
 *     requiresAuth: true,
 *   },
 * })
 * </script>
 *
 * <template>
 *  // HTML content
 * </template>
 */
export default definePlugin(async ({ router, pinia, event }) => {
  // 1. Load user profile if token is present.
  // When using SSR, it should be hydrated from the server

  // 2. If the page requires auth, check if user is logged in
  // if not, redirect to login page.
  router.beforeEach(async (to) => {
    const userSession = useUserSession(pinia)
    const token = useUserToken(event)
    const $fetch = useApiFetch(event)
    console.log('====================================');
    console.log(userSession.user);
    console.log(token.value);
    console.log('====================================');

    if (token.value && !userSession.user) {
      try {
        // Do api request call to retreive user profile.
        // Note that the api is provided with json-server
        const user = await $fetch('/users/profile')
        userSession.setUser(user.result)
      }
      catch (err) {
        token.value = undefined
      }
    }

    if (to.meta.requiresAuth && !token.value) {
      return {
        path: '/auth/login',
        query: { redirect: to.fullPath },
      }
    }
  })
})
