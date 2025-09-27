<script setup lang="ts">
const formOpen = ref(false)

const props = withDefaults(defineProps<{
    open?: boolean
    reason?: string
    title?: string
    data?: any
    labelSubmit?: string
    loadingSubmit?: boolean
}>(), {
    open: false,
    reason: '',
    title: 'Cancel Reason',
    data: {},
    labelSubmit: 'Cancel',
    loadingSubmit: false,
})
const emit = defineEmits<{
    (event: 'submit'): void
    (event: 'update:open', value: boolean): void
    (event: 'update:reason', value: string): void
}>()

watch(() => props.open, (newVal) => {
    formOpen.value = newVal;
}, { immediate: true });

const closeModal = () => {
    formOpen.value = false
    emit('update:open', false)
}

const localReason = ref(props.reason)
watch(localReason, (val) => {
    emit('update:reason', val)
})

</script>

<template>
    <VModal is="form" :open="formOpen" :title="props.title" size="small" actions="right"
        @submit.prevent="emit('submit')" @close="closeModal">
        <template #content>
            <div class="modal-form">
                <VField>
                    <VLabel>
                        Reason <span class="text-danger">*</span>
                    </VLabel>
                    <VControl class="control">
                        <textarea class="textarea" rows="4" placeholder="Cancel reason..." v-model="localReason" />
                    </VControl>
                </VField>
            </div>
        </template>
        <template #action>
            <VButton type="submit" color="primary" raised :loading="props.loadingSubmit">
                {{ props.labelSubmit }}
            </VButton>
        </template>
    </VModal>
</template>