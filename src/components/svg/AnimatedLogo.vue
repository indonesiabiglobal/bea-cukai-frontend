<script setup lang="ts">
const props = defineProps<{
  light?: boolean
}>()

const isLoading = ref(false)

if (!import.meta.env.SSR) {
  const router = useRouter()
  router.beforeEach(() => {
    isLoading.value = true
  })
  router.afterEach(() => {
    setTimeout(() => {
      isLoading.value = false
    }, 200)
  })
}
</script>

<template>
  <img src="/images/logos/logo/logo.png" alt="Logo" />
</template>

<style lang="scss" scoped>
.right {
  fill: color-mix(in oklab, var(--primary), black 20%);
}

.bottom {
  fill: var(--primary);
}

.left {
  fill: color-mix(in oklab, var(--primary), white 25%);
}

.is-roll,
svg:hover {
  .right {
    animation: is-roll-right 8s ease infinite;
    animation-fill-mode: forwards;
    animation-delay: 0s;
  }

  .left {
    animation: is-roll-left 8s ease infinite;
    animation-fill-mode: forwards;
    animation-delay: 0s;
  }

  .bottom {
    animation: is-roll-bottom 8s ease infinite;
    animation-fill-mode: forwards;
    animation-delay: 0s;
  }
}

.is-light {
  .right {
    fill: var(--white);
    animation: none;
  }

  .bottom {
    fill: #fffc;
    animation: none;
  }

  .left {
    fill: #fffa;
    animation: none;
  }
}

@keyframes is-roll-right {
  0% {
    fill: color-mix(in oklab, var(--primary), black 7%);
  }

  33% {
    fill: color-mix(in oklab, var(--primary), white 8%);
  }

  66% {
    fill: color-mix(in oklab, var(--primary), white 40%);
  }

  100% {
    fill: color-mix(in oklab, var(--primary), black 7%);
  }
}

@keyframes is-roll-bottom {
  0% {
    fill: var(--primary);
  }

  33% {
    fill: color-mix(in oklab, var(--primary), white 24%); // darken(#1ee8c0, 7%);
  }

  66% {
    fill: color-mix(in oklab, var(--primary), white 20%);
  }

  100% {
    fill: var(--primary);
  }
}

@keyframes is-roll-left {
  0% {
    fill: color-mix(in oklab, var(--primary), white 15%);
  }

  33% {
    fill: color-mix(in oklab, var(--primary), white 12%); // lighten(#1ee8c0, 15%);
  }

  66% {
    fill: color-mix(in oklab, var(--primary), white 15%);
  }

  100% {
    fill: color-mix(in oklab, var(--primary), white 15%);
  }
}
</style>
