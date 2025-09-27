<script setup lang="ts">
const props = defineProps(['menu'])
</script>

<template>
    <VDropdown icon="lucide:more-vertical" class="is-pushed-mobile" spaced right>
        <template #button="{ open }">
            <VIconButton color="primary" outlined icon="lucide:settings" class="mr-2" v-tooltip.top="'Setting'"
                @click="open" />
        </template>
        <template #content="{ close }">
            <RouterLink to="/modules/setting-attendance/work-shift" class="dropdown-item is-media" v-if="props.menu === 'settingSchedule'">
                <div class="icon">
                    <i aria-hidden="true" class="lnil lnil-alarm-clock" />
                </div>
                <div class="meta">
                    <span>Work Shift</span>
                    <span>Management Shift</span>
                </div>
            </RouterLink>
            <RouterLink to="/modules/setting-attendance/setting-schedule" class="dropdown-item is-media" v-if="props.menu === 'workShift' || props.menu === 'employeeSchedule'">
                <div class="icon">
                    <i aria-hidden="true" class="lnil lnil-calender-alt-1" />
                </div>
                <div class="meta">
                    <span>Setting Schedule</span>
                    <span>Management Setting Schedule</span>
                </div>
            </RouterLink>
        </template>
    </VDropdown>
</template>
