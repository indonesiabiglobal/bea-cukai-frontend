<template>
  <div class="page-content-inner">
    <TailwindPriorityExample />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import TailwindPriorityExample from '@/components/examples/TailwindPriorityExample.vue'

// Set page title for the tab
const title = 'Tailwind Priority Example'
const description = 'Demonstrasi sistem prioritas Tailwind CSS over Bulma'

// Inject meta data for tabs
const setTabMeta = inject<(meta: any) => void>('setTabMeta')
if (setTabMeta) {
  setTabMeta({
    title,
    description,
    icon: 'lnil lnil-grid-alt'
  })
}
</script>

<route lang="yaml">
meta:
  layout: admin
  requiresAuth: true
</route>