<script setup lang="ts">
export interface ActionDatatableProps {
    index?: number
    rows?: number
    data?: any
    hideDelete?: boolean
    hideEdit?: boolean
    hideView?: boolean
}
const props = withDefaults(defineProps<ActionDatatableProps>(), {
    data: {},
    index: 0,
    rows: 0,
    hideDelete: false,
    hideEdit: false,
    hideView: true,
})

const emit = defineEmits<{
    (event: 'view', data: any): void
    (event: 'edit', data: any): void
    (event: 'delete', data: any): void
}>()

const classDropdownMenu = 'dropdown-action'
</script>

<template>
    <VDropdown icon="lucide:more-vertical" class="is-pushed-mobile" spaced :right="true"
        :actionDatatable="true" :up="props.index >= (props.rows - 2)"
        :class="props.index < (props.rows - 2) ? 'is-down' : ''" :classes="{ menu: classDropdownMenu }">
        <template #button="{ open }">
            <VIconButton color="primary" outlined icon="lucide:settings" class="mr-2" v-tooltip.top="'Setting'"
                @click="open" />
        </template>
        <template #content="{ close }">
            <a role="button" class="dropdown-item is-media" @click="emit('view', props.data); close()" v-if="!props.hideView">
                <div class="icon">
                    <VIcon icon="lucide:eye" />
                </div>
                <div class="meta">
                    <span>View</span>
                </div>
            </a>
            <a role="button" class="dropdown-item is-media" @click="emit('edit', props.data); close()" v-if="!props.hideEdit">
                <div class="icon">
                    <VIcon icon="lucide:edit" />
                </div>
                <div class="meta">
                    <span>Edit</span>
                </div>
            </a>
            <a role="button" class="dropdown-item is-media" @click="emit('delete', props.data); close()" v-if="!props.hideDelete">
                <div class="icon">
                    <VIcon icon="lucide:trash-2" />
                </div>
                <div class="meta">
                    <span>Delete</span>
                </div>
            </a>
        </template>
    </VDropdown>
</template>