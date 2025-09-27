<script setup lang="ts">
export type VTagColor =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'orange'
  | 'blue'
  | 'green'
  | 'purple'
  | 'white'
  | 'light'
  | 'solid'
  | 'orange-500'
  | 'red-500'

export type VTagSize = 'tiny'

export interface VTagProps {
  label?: string | number
  color?: VTagColor
  size?: VTagSize
  rounded?: boolean
  curved?: boolean
  outlined?: boolean
  elevated?: boolean
  remove?: boolean
}

const props = withDefaults(defineProps<VTagProps>(), {
  label: undefined,
  color: undefined,
  size: undefined,
})
</script>

<template>
  <small
    class="tag"
    :class="[
      props.color && 'is-' + props.color,
      props.size && 'is-' + props.size,
      props.rounded && 'is-rounded',
      props.curved && 'is-curved',
      props.outlined && 'is-outlined',
      props.elevated && 'is-elevated',
      props.remove && 'is-delete',
    ]"
  ><slot>{{ props.label }}</slot></small>
</template>

<style lang="scss">
.tag:not(body) {
  display: inline-block;
  line-height: 2.3;
  height: 2.4em;
  font-size: 0.75rem;

  &.is-rounded {
    padding-inline-start: 1em;
    padding-inline-end: 1em;
  }

  &.is-curved {
    padding-inline-start: 0.85em;
    padding-inline-end: 0.85em;
    line-height: 2.5;
    height: 2.6em;
    border-radius: 8px;
  }

  &.is-tiny {
    line-height: 1.3;
    height: 1.6em;
    font-size: 0.7rem;

    &.is-curved {
      padding-inline-start: 0.55em;
      padding-inline-end: 0.55em;
      line-height: 1.3;
      height: 1.6em;
    }
  }

  &.is-elevated {
    box-shadow: var(--light-box-shadow);
  }

  &.is-solid {
    background: var(--white);
    border: 1px solid color-mix(in oklab, var(--fade-grey), black 3%);
    color: var(--light-text);
  }

  &.is-primary {
    &.is-elevated {
      box-shadow: var(--primary-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--primary);
      border: 1px solid var(--primary);
    }
  }

  &.is-success {
    &.is-elevated {
      box-shadow: var(--success-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--success);
      border: 1px solid var(--success);
    }
  }

  &.is-info {
    &.is-elevated {
      box-shadow: var(--info-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--info);
      border: 1px solid var(--info);
    }
  }

  &.is-warning {
    &.is-elevated {
      box-shadow: var(--warning-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--warning);
      border: 1px solid var(--warning);
    }
  }

  &.is-danger {
    &.is-elevated {
      box-shadow: var(--danger-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--danger);
      border: 1px solid var(--danger);
    }
  }

  &.is-secondary {
    background: var(--secondary);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--secondary-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--secondary);
      border: 1px solid var(--secondary);
    }
  }

  &.is-green {
    background: var(--green);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--green-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--green);
      border: 1px solid var(--green);
    }
  }

  &.is-blue {
    background: var(--blue);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--blue-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--blue);
      border: 1px solid var(--blue);
    }
  }

  &.is-purple {
    background: var(--purple);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--purple-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--purple);
      border: 1px solid var(--purple);
    }
  }

  &.is-orange {
    background: var(--orange);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--orange-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--orange);
      border: 1px solid var(--orange);
    }
  }

  &.is-orange-500 {
    background-color: rgb(249 115 22 / var(--tw-bg-opacity, 1));
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--orange-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--orange-500);
      border: 1px solid var(--orange-500);
    }
  }

  &.is-red-500 {
    background-color: rgb(239 68 68 / var(--tw-bg-opacity, 1));
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--red-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--red-500);
      border: 1px solid var(--red-500);
    }
  }
}

.is-dark {
  .tag {
    &:not(
        .is-primary,
        .is-secondary,
        .is-success,
        .is-info,
        .is-warning,
        .is-danger,
        .is-orange,
        .is-orange-500,
        .is-green,
        .is-blue,
        .is-purple
      ) {
      background: color-mix(in oklab, var(--dark-sidebar), white 10%);
      border-color: color-mix(in oklab, var(--dark-sidebar), white 10%);
      color: var(--dark-dark-text);
    }

    &.is-primary {
      background: var(--primary);

      &.is-outlined {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.is-light {
        background: color-mix(in oklab, var(--primary), white 22%);
        color: var(--primary);
      }
    }

    &.is-orange-500 {
      background: var(--orange-500);

      &.is-outlined {
        border-color: var(--orange-500);
        color: var(--orange-500);
      }

      &.is-light {
        background: color-mix(in oklab, var(--orange-500), white 22%);
        color: var(--orange-500);
      }
    }

    &.is-red-500 {
      background: var(--red-500);

      &.is-outlined {
        border-color: var(--red-500);
        color: var(--red-500);
      }

      &.is-light {
        background: color-mix(in oklab, var(--red-500), white 22%);
        color: var(--red-500);
      }
    }
  }
}
</style>
