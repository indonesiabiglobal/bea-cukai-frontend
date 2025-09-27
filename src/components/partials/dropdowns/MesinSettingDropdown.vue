<script setup lang="ts">
const props = defineProps(['menu'])
</script>

<template>
    <VDropdown icon="lucide:more-vertical" class="is-pushed-mobile" spaced right>
        <template #button="{ open }">
            <VIconButton color="primary" outlined icon="lucide:settings" class="mr-2" v-tooltip="'Setting'"
                @click="open" />
        </template>
        <template #content="{ close }">
            <RouterLink to="/modules/machine/merk" class="dropdown-item is-media">
                <div class="icon">
                    <i aria-hidden="true" class="lnil lnil-eye" />
                </div>
                <div class="meta">
                    <span>Brand</span>
                    <span>Management Brand</span>
                </div>
            </RouterLink>

            <RouterLink to="/modules/machine/tipe" role="menuitem" class="dropdown-item is-media" @click.prevent="close" v-if="props.menu == 'Machine'">
                <div class="icon">
                    <i aria-hidden="true" class="lnil lnil-briefcase" />
                </div>
                <div class="meta">
                    <span>Type</span>
                    <span>Management Type</span>
                </div>
            </RouterLink>

            <RouterLink to="/modules/machine" role="menuitem" class="dropdown-item is-media" @click.prevent="close" v-if="props.menu == 'Type'">
                <div class="icon">
                    <i aria-hidden="true" class="lnil lnil-briefcase" />
                </div>
                <div class="meta">
                    <span>Machine</span>
                    <span>Management Machine</span>
                </div>
            </RouterLink>
        </template>
    </VDropdown>
</template>
