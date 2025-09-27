<script setup lang="ts">
const props = defineProps<{
  modelValue: 'en' | 'id'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'en' | 'id'): void
}>()

const languages = ['en', 'id'] as const
type LanguageType = (typeof languages)[number]

const activeLang = computed({
  get: () => props.modelValue,
  set: (val: LanguageType) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="tabs is-toggle is-toggle-rounded p-0 m-0">
    <ul class="m-0 p-0">
      <li
        v-for="lang in languages"
        :key="lang"
        :class="{ 'is-active': activeLang === lang }"
      >
        <a @click="activeLang = lang">
          <span class="flag-icon" :class="`flag-icon-${lang}`"></span>
          <span>{{ lang.toUpperCase() }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
