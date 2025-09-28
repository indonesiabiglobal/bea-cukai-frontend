<script setup lang="ts">
import config from '/@src/config.ts'
definePage({
  meta: {
    requiresAuth: true,
  },
})  

const title = config.site_title
const pageTitle = useVueroContext<string>('page-title')

useHead({
  title: title,
})

onMounted(() => {
  pageTitle.value = 'Fukusuke Kogyo Indonesia'
})
</script>

<template>
  <MainPages />
</template>

<style scoped lang="scss"></style>
