<script setup lang="ts">
import config from '/@src/config.ts'

const title = config.site_title
const pageTitle = useVueroContext<string>('page-title')

useHead({
  title: title,
})

onMounted(() => {
  pageTitle.value = 'Main Panel'
})
</script>

<template>
  <MainPages />
</template>

<style scoped lang="scss"></style>
