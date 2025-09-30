<script setup lang="ts">
/**
 * Imports
 */
import AutoComplete from 'primevue/autocomplete';
import { FormManualScheduleDate } from '/@src/types/Setting/Schedule';
import dayjs from 'dayjs';
import DatePicker from 'primevue/datepicker';

const useApi = useApiFetchV2()

/**
 * Data properties
 */
const props = defineProps<{
  modelValue: FormManualScheduleDate;
  employee: any;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: FormManualScheduleDate[]): void;
}>();

// Reactive data
const input = ref<FormManualScheduleDate>(props.modelValue);

// Watch input dan emit perubahan ke parent
watch(input, (newValue: any) => {
  emit('update:modelValue', newValue);
}, { deep: true });

/**
 * Shift Data
 */
const shifts = ref([]);
const day_off: any = ref({});
const shiftItems = ref([]);
const search = (e: any) => {
  shiftItems.value = shifts.value.filter((shift: any) => {
    return shift.nama_shift.toLowerCase().includes(e.query.toLowerCase());
  });
}
const isLoadingFetchShifts = ref(false)
const fetchShifts = async () => {
  isLoadingFetchShifts.value = true
  await useApi.get(`/work-shift/combo`, {}, false).then((res) => {
    shifts.value = res.result.shift
    day_off.value = res.result.day_off
  }).finally(() => {
    isLoadingFetchShifts.value = false
  })
}

/**
 * Methods
 */
const changeDayOff = () => {
  if (input.value.hari_libur) {
    input.value.shift = day_off.value
  } else {
    input.value.shift = null
  }
}

/**
 * lifecycle
 */
onMounted(() => {
  fetchShifts()
})
</script>

<template>
  <div class="modal-form">
    <!-- Employee -->
    <h3 class="mb-1">Employee</h3>
    <VField v-slot="{ id }">
      <VControl>
        <Multiselect v-model="input.nip_pegawai" :attrs="{ id }" mode="single" :options="props.employee"
          placeholder="Choose Employees" :disabled="true" />
      </VControl>
    </VField>
    <!-- Effective Date -->
    <h3 class="mb-1">Date Shift</h3>
    <VField>
      <VControl>
        <DatePicker dateFormat="dd M yy" v-model="input.tanggal_shift" fluid disabled />
      </VControl>
    </VField>
    <!-- Day Off -->
    <h3 class="mb-1">Day Off</h3>
    <VField horizontal>
      <VControl>
        <VSwitchSegment v-model="input.hari_libur" color="danger" @update:model-value="changeDayOff()" :disabled="isLoadingFetchShifts" />
      </VControl>
    </VField>
    <!-- Work Shift -->
    <h3 class="mb-1">Work Shift</h3>
    <VField horizontal>
      <VControl fullwidth>
        <AutoComplete v-model="input.shift" :dropdown="true" :suggestions="shiftItems" fluid :disabled="input.hari_libur"
          :loading="isLoadingFetchShifts" optionLabel="nama_shift" placeholder="Choose shift" size="large"
          @complete="search">
          <template #option="slotProps">
            <div class="items-center">
              <div class="text">
                {{ slotProps.option.nama_shift }} ({{ slotProps.option.kode_shift }})
                <br />
                {{ slotProps.option.jam_masuk }} - {{ slotProps.option.jam_pulang }}
              </div>
            </div>
          </template>
        </AutoComplete>
      </VControl>
    </VField>
  </div>
</template>

<style lang="scss" scoped>
@import '/@src/scss/abstracts/all';
@import '/@src/scss/components/forms-outer';


.form-body {
  padding: 0;

  .form-section {
    padding: 40px;
    border-bottom: 1px solid color-mix(in oklab, var(--fade-grey), black 4%);

    &.is-grey {
      background: #fafafa;
    }

    .left,
    .right {
      padding: 20px 40px;
      width: 50%;

      h3 {
        font-family: var(--font-alt);
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--dark-text);
        margin-bottom: 20px;
      }
    }

    .left {
      position: relative;
      border-inline-end: 1px solid color-mix(in oklab, var(--fade-grey), black 3%);

      .operator {
        position: absolute;
        top: 17px;
        inset-inline-end: -10px;
        text-transform: uppercase;
        font-family: var(--font);
        font-weight: 500;
        color: var(--dark-text);
        background: var(--white);
        padding: 4px 0;
      }
    }

    .form-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid color-mix(in oklab, var(--fade-grey), black 4%);
      padding-bottom: 20px;
      margin-bottom: 30px;

      h3 {
        font-family: var(--font-alt);
        font-weight: 600;
        color: var(--dark-text);
      }
    }

    .form-section-inner {
      .field {
        &.is-horizontal {
          .field-label {
            padding-top: 0.75em;
          }
        }
      }
    }

    .columns {
      .column {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
    }

    .field {
      .control {
        .checkbox {
          padding: 0;
          padding-inline-end: 10px;
          font-size: 0.9rem;
        }
      }
    }

    .participants {
      display: flex;
      padding-bottom: 10px;

      .v-avatar {
        margin-inline-end: 8px;
      }

      .add-participant {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        width: 40px;
        min-width: 40px;
        border-radius: var(--radius-rounded);
        border: 1.6px dashed var(--light-text);
        color: var(--light-text);
        padding: 0;
        background: none;
        margin-inline-start: 4px;
        cursor: pointer;
        transition:
          color 0.3s,
          background-color 0.3s,
          border-color 0.3s,
          height 0.3s,
          width 0.3s;

        &:hover,
        &:focus {
          border: 1.6px solid var(--primary);
          color: var(--primary);
        }

        &:focus-visible {
          outline-offset: var(--accessibility-focus-outline-offset);
          outline-width: var(--accessibility-focus-outline-width);
          outline-style: var(--accessibility-focus-outline-style);
          outline-color: var(--accessibility-focus-outline-color);
        }

        .iconify {
          height: 16px;
          width: 16px;
        }
      }
    }

    .color-codes {
      display: flex;
      align-items: center;
      height: 38px;

      .color-code {
        height: 14px;
        width: 14px;
        border-radius: var(--radius-rounded);
        background: var(--white);
        margin-inline-end: 10px;
        border: 3px solid var(--light-text);
        cursor: pointer;
        opacity: 0.6;
        transition:
          color 0.3s,
          background-color 0.3s,
          border-color 0.3s,
          height 0.3s,
          width 0.3s;

        &:hover,
        &:focus {
          opacity: 1;
        }

        &:focus-visible {
          outline-offset: var(--accessibility-focus-outline-offset);
          outline-width: var(--accessibility-focus-outline-width);
          outline-style: var(--accessibility-focus-outline-style);
          outline-color: var(--accessibility-focus-outline-color);
        }

        &.is-primary {
          border-color: var(--primary);

          &.is-active {
            background: var(--primary);
          }
        }

        &.is-secondary {
          border-color: var(--secondary);

          &.is-active {
            background: var(--secondary);
          }
        }

        &.is-info {
          border-color: var(--info);

          &.is-active {
            background: var(--info);
          }
        }

        &.is-success {
          border-color: var(--success);

          &.is-active {
            background: var(--success);
          }
        }

        &.is-purple {
          border-color: var(--purple);

          &.is-active {
            background: var(--purple);
          }
        }
      }
    }

    .add-link {
      display: inline-block;
      padding: 4px 0;
      font-family: var(--font);
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--primary);
    }
  }
}

.form-body {
  .form-section {
    border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);

    &.is-grey {
      background: color-mix(in oklab, var(--dark-sidebar), white 4%);
    }

    .left {
      border-color: color-mix(in oklab, var(--dark-sidebar), white 12%) !important;

      .operator {
        background: color-mix(in oklab, var(--dark-sidebar), white 6%) !important;
        color: var(--dark-dark-text);
      }

      .radio-pills {
        .radio-pill {
          input {
            &:checked+.radio-pill-inner {
              border-color: var(--primary);
              background: var(--primary);
              box-shadow: var(--primary-box-shadow);
              color: var(--smoke-white);
            }
          }

          .radio-pill-inner {
            background: color-mix(in oklab, var(--dark-sidebar), white 2%);
            border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);
            color: var(--dark-dark-text);
          }
        }
      }
    }

    .form-section-header {
      border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);

      .left {
        h3 {
          color: var(--dark-dark-text);
        }
      }
    }

    .form-section-inner {
      .add-link {
        color: var(--primary);
      }

      .color-codes {
        .color-code {
          background: color-mix(in oklab, var(--dark-sidebar), white 6%);

          &.is-primary {
            border-color: var(--primary);
          }
        }
      }

      .participants {
        .add-participant {
          &:hover {
            border: 1.6px solid var(--primary);
            color: var(--primary);
          }
        }
      }
    }
  }
}

@media only screen and (width <=767px) {
  .form-body {
    .form-section {

      .left,
      .right {
        width: 100%;
        padding-inline-end: 30px;
        padding-inline-start: 30px;
      }

      .left {
        border-inline-end: none;
        border-bottom: 1px solid color-mix(in oklab, var(--fade-grey), black 3%);
        padding-bottom: 40px;

        .operator {
          top: unset;
          bottom: -14px;
          inset-inline-start: 0;
          inset-inline-end: 0;
          margin: 0 auto;
          text-align: center;
          max-width: 60px;
        }
      }

      .right {
        padding-top: 30px;
      }
    }

    .is-vhidden {
      display: none !important;
    }
  }
}

.p-datepicker .p-inputtext:disabled {
  opacity: 0.4;
  color: var(--dark-text);
}
</style>
