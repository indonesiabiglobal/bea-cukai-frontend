<script setup lang="ts">
import config from '/@src/config.ts';

const title = config.site_title;
const pageTitle = useVueroContext<string>('page-title')

useHead({
  title: title, 
})

onMounted(() => {
  pageTitle.value = 'Dashboard Purchasing Panel'
})
</script>

<template>
  <div>
    <PurchasingDashboard />
  </div>
</template>

<style scoped lang="scss">
#vuero-demos,
#vuero-components {
  scroll-margin-top: 50px;
}
</style>
