<script setup lang="ts">
export interface ActionDatatableProps {
    index?: number
    rows?: number
    data?: any
    hideAccept?: boolean
    labelCancel?: string
}
const props = withDefaults(defineProps<ActionDatatableProps>(), {
    data: {},
    index: 0,
    rows: 0,
    hideAccept: true,
    labelCancel: 'Cancel',
})

const emit = defineEmits<{
    (event: 'view', data: any): void
    (event: 'accept', data: any): void
    (event: 'cancel', data: any): void
}>()

const classDropdownMenu = 'dropdown-action'
</script>

<template>
    <VDropdown icon="lucide:more-vertical" class="is-pushed-mobile is-appointment-table" spaced :right="true"
        :actionDatatable="true" :up="props.index >= (props.rows - 2)"
        :class="props.index < (props.rows - 2) ? 'is-down' : ''" :classes="{ menu: classDropdownMenu }">
        <template #button="{ open }">
            <VIconButton color="primary" outlined icon="lucide:settings" class="mr-2" v-tooltip.top="'Setting'"
                @click="open" />
        </template>
        <template #content="{ close }">
            <a role="button" class="dropdown-item is-media" @click="emit('accept', props.data); close()"
                v-if="!props.hideAccept">
                <div class="icon">
                    <VIcon icon="lucide:edit" />
                </div>
                <div class="meta">
                    <span>Accept</span>
                </div>
            </a>
            <a role="button" class="dropdown-item is-media" @click="emit('cancel', props.data); close()">
                <div class="icon">
                    <VIcon icon="lucide:trash-2" />
                </div>
                <div class="meta">
                    <span>{{ props.labelCancel }}</span>
                </div>
            </a>
        </template>
    </VDropdown>
</template>
