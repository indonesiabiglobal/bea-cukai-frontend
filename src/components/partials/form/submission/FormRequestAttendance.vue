<script setup lang="ts">
/**
 * Imports
 */
import { FormRequestAttendance } from '/@src/types/Form/Submission/RequestAttendance';
import dayjs from 'dayjs';
import DatePicker from 'primevue/datepicker';
import { setTime } from '/@src/utils/date/setTime';

const useApi = useApiFetchV2()

/**
 * Data properties
 */
const props = defineProps<{
    open: boolean;
    isLoaderSaveRequest: boolean;
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: FormRequestAttendance[]): void;
}>();

// Reactive data
const input = ref<FormRequestAttendance>({
    'date': new Date(),
    'clockIn': setTime(8, 0),
    'clockOut': setTime(17, 0),
    'description': '',
});

/**
 * Request Attendance
 */
const wasOpen = ref(false);
const isLoaderSaveRequest = ref(false);

watchEffect(() => {
    wasOpen.value = props.open;
});
const onSubmitRequestAttendance = async () => {
    isLoaderSaveRequest.value = true;
    const data = {
        tanggal: dayjs(input.value.date).format('YYYY-MM-DD'),
        jam_masuk: dayjs(input.value.clockIn).format('HH:mm:ss'),
        jam_pulang: dayjs(input.value.clockOut).format('HH:mm:ss'),
        keterangan: input.value.description,
    };
    await useApi.post('request-attendance', data).then((res) => {
        wasOpen.value = false;
    }).catch((err) => {
        console.log(err)
    }).finally(() => {
        isLoaderSaveRequest.value = false;
    });
};

</script>

<template>
    <VModal is="form" method="post" novalidate :open="wasOpen" title="Request Attendance" actions="right"
        @submit.prevent="onSubmitRequestAttendance" @close="wasOpen = false" size="small">
        <template #content>
            <div class="modal-form">
                <!-- Date -->
                <h3 class="mb-1">Date</h3>
                <VField>
                    <VControl>
                        <DatePicker dateFormat="dd M yy" v-model="input.date" fluid :minDate="new Date()" />
                    </VControl>
                </VField>
                <!-- Clock In -->
                <h3 class="mb-1">Clock In</h3>
                <VField id="jam_masuk" v-slot="{ field }">
                    <VControl>
                        <DatePicker id="datepicker-timeonly" :model-value="input.clockIn" timeOnly fluid />
                    </VControl>
                    <p v-if="field?.errorMessage" class="help is-danger">
                        {{ field.errorMessage }}
                    </p>
                </VField>
                <!-- Clock Out -->
                <h3 class="mb-1">Clock Out</h3>
                <VField id="jam_pulang" v-slot="{ field }">
                    <VControl>
                        <DatePicker id="datepicker-timeonly" :model-value="input.clockOut" timeOnly fluid />
                    </VControl>
                    <p v-if="field?.errorMessage" class="help is-danger">
                        {{ field.errorMessage }}
                    </p>
                </VField>
                <!-- Description -->
                <h3 class="mb-1">Description</h3>
                <VField id="jam_pulang" v-slot="{ field }">
                    <VControl>
                        <VTextarea v-model="input.description" class="textarea" rows="4"
                            placeholder="Enter a description" autocomplete="off" autocapitalize="off"
                            spellcheck="true" />
                    </VControl>
                </VField>
            </div>
        </template>
        <template #action>
            <VButton type="submit" color="primary" raised :loading="isLoaderSaveRequest">
                Save
            </VButton>
        </template>
    </VModal>
</template>

<style lang="scss">
@import '/@src/scss/abstracts/all';

.all-projects {
    margin-top: 32px;

    .project-grid {
        margin-bottom: 1.5rem;

        .project-grid-item {
            @include vuero-s-card;

            text-align: center;
            box-shadow: none;

            &:hover,
            &:focus {
                border-color: color-mix(in oklab, var(--fade-grey), black 6%);
                box-shadow: var(--light-box-shadow);

                .project-avatar {
                    filter: grayscale(0);
                    opacity: 1;
                }
            }

            .project-avatar {
                display: block;
                height: 40px;
                width: 40px;
                border-radius: 10px;
                margin: 0 auto 10px;
                filter: grayscale(1);
                opacity: 0.6;
                transition: all 0.3s; // transition-all test
            }

            h3 {
                font-size: 0.95rem;
                font-family: var(--font-alt);
                font-weight: 600;
                color: var(--dark-text);
            }

            p {
                font-size: 0.9rem;
                margin-bottom: 10px;
            }
        }
    }
}

.is-dark {
    .all-projects {
        .project-grid {
            .project-grid-item {
                @include vuero-card--dark;

                h3 {
                    color: var(--dark-dark-text);
                }
            }
        }

        .dashboard-body {
            .dashboard-card {
                @include vuero-card--dark;

                &.is-upgrade {
                    background: var(--primary);
                    border-color: var(--primary);
                    box-shadow: var(--primary-box-shadow);
                }

                .quick-stats {
                    .quick-stats-inner {
                        .quick-stat {
                            background: color-mix(in oklab, var(--dark-sidebar), white 2%);
                            border: 1px solid color-mix(in oklab, var(--dark-sidebar), white 12%);

                            .media-flex-center {
                                .flex-meta {
                                    span {
                                        &:first-child {
                                            color: var(--dark-dark-text);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }


}

@media only screen and (width <=767px) {
    .all-projects {
        .all-projects-header {
            flex-direction: column;

            .header-item {
                width: 100%;
                border-inline-end: none;
                border-bottom: 1px solid color-mix(in oklab, var(--fade-grey), black 3%);
                padding: 16px 0;

                &:last-child {
                    border-bottom: none;
                }
            }
        }

        .projects-card-grid {
            .grid-item {
                .bottom-section {
                    flex-wrap: wrap;

                    .foot-block {
                        &:first-child {
                            width: 100%;
                            margin: 0;
                            text-align: center;
                            padding: 16px 0;

                            .developers {
                                justify-content: center;

                                .v-avatar {
                                    margin: 0 4px;
                                }
                            }
                        }

                        &:not(:first-child) {
                            width: 33.3%;
                            text-align: center;
                            margin: 0;
                        }
                    }
                }
            }
        }

        .illustration-header {
            >img {
                display: none !important;
            }

            .header-stats {
                .stats-inner {
                    flex-wrap: wrap;

                    .stat-item {
                        width: 50%;
                        margin: 0;
                        padding: 16px 0;
                    }
                }
            }
        }

        .project-minimal-grid {
            .grid-header {
                .filter {
                    display: none;
                }
            }
        }

        .dashboard-body {
            .dashboard-card {
                .quick-stats {
                    .quick-stats-inner {
                        .quick-stat {
                            padding: 20px;

                            .media-flex-center {
                                flex-direction: column;

                                .flex-meta {
                                    margin: 10px 0;
                                    text-align: center;
                                }
                            }
                        }
                    }
                }
            }
        }
    }


}

@media only screen and (width >=768px) and (width <=1024px) and (orientation: portrait) {
    .all-projects {
        .illustration-header {
            >img {
                display: none !important;
            }

            .header-stats {
                .stats-inner {
                    width: 100%;

                    .stat-item {
                        width: 25%;
                    }
                }
            }
        }

        .project-minimal-grid {
            .grid-body {
                display: flex;

                .column {
                    min-width: 50%;
                }
            }
        }

        .dashboard-body {
            .dashboard-card {
                .quick-stats {
                    .quick-stats-inner {
                        .quick-stat {
                            padding: 20px;

                            .media-flex-center {
                                flex-direction: column;

                                .flex-meta {
                                    margin: 2px 0 0;
                                    text-align: center;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}

@media only screen and (width >=768px) and (width <=1024px) and (orientation: landscape) {
    .all-projects {
        .illustration-header {
            .header-stats {
                .stats-inner {
                    .stat-item {
                        width: 25%;
                    }
                }
            }
        }

        .recent-projects {
            .project-box {
                h3 {
                    font-size: 1.1rem;
                }
            }
        }

        .project-minimal-grid {
            .grid-body {
                .grid-item {
                    .item-title {
                        padding: 30px 0;

                        h3 {
                            font-size: 1.5rem;
                        }
                    }
                }
            }
        }

        .projects-card-grid {
            .grid-item {
                .bottom-section {
                    margin-top: 0.75rem;

                    .foot-block {
                        &:first-child {
                            display: none;
                        }
                    }
                }
            }
        }
    }
}


.booking-bar-wrapper {
    @include vuero-s-card;

    margin-bottom: 32px;
    position: relative;
    background: linear-gradient(135deg, #48b2e4, #0782bd);
    // background: var(--primary);
    border-color: var(--primary);
    color: var(--white);
    font-family: var(--font);
    box-shadow: var(--primary-box-shadow);

    .travel-illustration {
        bottom: -50px;
        position: absolute;
        inset-inline-end: 30px;
        max-width: 370px;
    }

    .booking-bar-info {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .lnil {
            font-size: 2.2rem;
            color: var(--white);
        }

        .inner {
            margin-inline-start: 16px;

            .booking-bar-heading {
                font-family: var(--font-alt);
                font-size: 1.4rem;
                font-weight: 600;
                line-height: 1.2;
                color: var(--white);
            }

            .booking-bar-sub-heading {
                font-family: var(--font);
                font-weight: 500;
                font-size: .9rem;
                color: var(--light-grey);
            }
        }
    }

    .booking-bar {
        display: flex;
        // justify-content: space-between;
        align-items: center;

        .booking-bar-inputs {
            display: flex;
            align-items: center;

            .control:not(:last-of-type) {
                margin-inline-end: 2rem;
            }

            .input {
                font-family: var(--font);
                color: var(--light-text);
            }
        }
    }
}

.is-dark {
    .booking-bar-wrapper {
        @include vuero-card--dark;

        background: color-mix(in oklab, var(--dark-sidebar), white 4%);
        border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);
        box-shadow: var(--light-box-shadow);
    }
}

@media only screen and (width <=767px) {
    .booking-bar-wrapper {
        .travel-illustration {
            position: static;
            margin-bottom: 20px;
        }

        .booking-bar {
            >div {
                width: 100%;
            }

            .booking-bar-inputs {
                flex-direction: column;
                width: 100%;

                .control {
                    margin: 0 !important;
                    width: 100% !important;

                    &:first-child {
                        margin-bottom: 1rem !important;
                    }
                }
            }
        }
    }
}


@media only screen and (width >=768px) and (width <=1024px) and (orientation: portrait) {
    .booking-bar-wrapper {
        .travel-illustration {
            bottom: -42px;
            inset-inline-end: -25px;
            max-width: 215px;
        }
    }
}

@media only screen and (width >=768px) and (width <=1024px) and (orientation: landscape) {
    .booking-bar-wrapper {
        .travel-illustration {
            bottom: -42px;
            inset-inline-end: -12px;
            max-width: 200px;
        }
    }
}

.dashboard-body {
    .dashboard-card {
        @include vuero-s-card;
        border-radius: var(--radius-xtra-large);

        font-family: var(--font);

        >h4,
        .ApexCharts-title-text {
            font-family: var(--font-alt);
            font-size: 1rem;
            font-weight: 600;
            color: var(--dark-text);
            margin-bottom: 12px;
        }

        .quick-stats {
            .quick-stats-inner {
                display: flex;
                flex-wrap: wrap;
                // margin-inline-start: -8px;
                // margin-inline-end: -8px;
                gap: 16px;

                .quick-stat {
                    // width: calc(50% - 16px);
                    padding: 40px 20px;
                    background: var(--widget-grey);
                    // margin: 8px;
                    border-radius: var(--radius-large);
                    transition: all 0.3s; // transition-all test

                    :deep(.media-flex-center) {
                        .flex-meta {
                            span {
                                &:first-child {
                                    font-size: 1.4rem;
                                    font-weight: 600;
                                    color: var(--dark-text);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .dashboard-card {
        &.is-upgrade {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            background: color-mix(in oklab, var(--primary), white 8%);
            border-color: color-mix(in oklab, var(--primary), white 8%);
            padding: 20px 40px;
            min-height: 320px;
            border-radius: var(--radius-large);
            box-shadow: var(--primary-box-shadow);

            .lnil,
            .lnir {
                position: absolute;
                bottom: 1rem;
                inset-inline-end: 1rem;
                font-size: 4rem;
                opacity: 0.3;
            }

            .cta-content {
                text-align: center;

                h4 {
                    font-family: var(--font-alt);
                    font-weight: 600;
                    font-size: 1.2rem;
                    color: var(--smoke-white);
                    margin-bottom: 8px;
                }
            }

            .link {
                display: block;
                font-family: var(--font-alt);
                font-weight: 500;
                margin-top: 0.5rem;

                &:hover,
                &:focus {
                    color: var(--smoke-white);
                    opacity: 0.6;
                }
            }
        }
    }
}

/* Border untuk kolom yang dibekukan */
.datatable-frozen-name {
    border-right: 2px solid #ddd !important;
}

.datatable-frozen-action {
    border-left: 2px solid #ddd !important;
}

table {
    border-collapse: separate;
    border-spacing: 0;
}

/* Style untuk VDropdown */
.dropdown.is-down .dropdown-menu {
    left: auto;
    right: 145% !important;
    top: 0;
    margin-top: 0;
    position: absolute;
    z-index: 1050;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown.is-up .dropdown-menu {
    left: auto;
    right: 145% !important;
    top: -300%;
    margin-top: 0;
    position: absolute;
    z-index: 1050;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-menu {
    transition: all 0.2s ease-in-out;
    // opacity: 0;
    // visibility: hidden;
}

.button.bg-dark-blue {
    background-color: var(--dark-blue);
    color: #ddd;
    border-color: var(--dark-blue);
}

.button.bg-dark-blue:hover {
    background-color: #118ec8;
    color: #ddd;
    border-color: #118ec8;
}

.button.bg-dark-blue:focus {
    background-color: #118ec8;
    color: #ddd;
    border-color: #118ec8;
}

.modal-form {
    h3 {
        font-family: var(--font-alt);
        font-weight: 600;
        color: var(--dark-text);
    }
}
</style>
