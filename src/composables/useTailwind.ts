/**
 * Composable untuk mempermudah penggunaan Tailwind CSS utilities
 * dalam komponen Vue
 */

import { computed, ref, type Ref } from 'vue'
import { 
  cn, 
  layouts, 
  cardStyles, 
  buttonStyles, 
  statusStyles, 
  typography,
  shadows,
  colors,
  loadingClasses,
  responsiveText
} from '/@src/utils/tailwind'

/**
 * Composable untuk layout utilities
 */
export function useTailwindLayout() {
  return {
    container: layouts.container,
    grid: layouts.grid,
    flex: layouts.flex,
  }
}

/**
 * Composable untuk card styling
 */
export function useTailwindCard(options: {
  hoverable?: boolean
  bordered?: boolean
  interactive?: boolean
} = {}) {
  const cardClass = computed(() => {
    return cn(
      cardStyles.base,
      options.hoverable && cardStyles.hover,
      options.bordered && cardStyles.bordered,
      options.interactive && cardStyles.interactive
    )
  })

  return {
    cardClass
  }
}

/**
 * Composable untuk button styling
 */
export function useTailwindButton(variant: Ref<keyof typeof buttonStyles> = ref('primary')) {
  const buttonClass = computed(() => {
    return buttonStyles[variant.value] || buttonStyles.primary
  })

  return {
    buttonClass,
    variants: Object.keys(buttonStyles) as (keyof typeof buttonStyles)[]
  }
}

/**
 * Composable untuk status indicators
 */
export function useTailwindStatus(status: Ref<keyof typeof statusStyles> = ref('neutral')) {
  const statusClass = computed(() => {
    return statusStyles[status.value] || statusStyles.neutral
  })

  return {
    statusClass,
    statuses: Object.keys(statusStyles) as (keyof typeof statusStyles)[]
  }
}

/**
 * Composable untuk typography
 */
export function useTailwindTypography() {
  return {
    heading: typography,
    responsive: responsiveText
  }
}

/**
 * Composable untuk theme colors
 */
export function useTailwindColors() {
  return {
    colors,
    shadows
  }
}

/**
 * Composable untuk loading states
 */
export function useTailwindLoading(isLoading: Ref<boolean>) {
  const loadingClass = computed(() => {
    return loadingClasses(isLoading.value)
  })

  return {
    loadingClass
  }
}

/**
 * Composable untuk responsive design
 */
export function useTailwindResponsive() {
  const isSmall = ref(false)
  const isMedium = ref(false)
  const isLarge = ref(false)
  const isExtraLarge = ref(false)

  // Media query listeners
  const checkBreakpoints = () => {
    if (typeof window !== 'undefined') {
      isSmall.value = window.matchMedia('(min-width: 640px)').matches
      isMedium.value = window.matchMedia('(min-width: 768px)').matches
      isLarge.value = window.matchMedia('(min-width: 1024px)').matches
      isExtraLarge.value = window.matchMedia('(min-width: 1280px)').matches
    }
  }

  // Initialize and listen for changes
  onMounted(() => {
    checkBreakpoints()
    window.addEventListener('resize', checkBreakpoints)
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', checkBreakpoints)
    }
  })

  return {
    isSmall: readonly(isSmall),
    isMedium: readonly(isMedium),
    isLarge: readonly(isLarge),
    isExtraLarge: readonly(isExtraLarge)
  }
}

/**
 * Composable untuk animation utilities
 */
export function useTailwindAnimation() {
  const animate = (element: HTMLElement, animation: string, options: {
    duration?: number
    onComplete?: () => void
  } = {}) => {
    const { duration = 300, onComplete } = options
    
    element.style.transition = `all ${duration}ms ease-in-out`
    element.classList.add(animation)
    
    setTimeout(() => {
      element.classList.remove(animation)
      if (onComplete) onComplete()
    }, duration)
  }

  return {
    animate
  }
}

/**
 * Composable untuk conditional styling
 */
export function useTailwindConditional() {
  const conditionalClass = (condition: boolean, trueClass: string, falseClass = '') => {
    return condition ? trueClass : falseClass
  }

  const toggleClass = (condition: Ref<boolean>, trueClass: string, falseClass = '') => {
    return computed(() => conditionalClass(condition.value, trueClass, falseClass))
  }

  return {
    conditionalClass,
    toggleClass,
    cn
  }
}

/**
 * Composable untuk form styling
 */
export function useTailwindForm() {
  const inputClass = ref('tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent')
  const labelClass = ref('tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2')
  const errorClass = ref('tw-text-red-600 tw-text-sm tw-mt-1')
  const groupClass = ref('tw-mb-4')

  const getValidationClass = (isValid: boolean, isError: boolean) => {
    if (isError) return 'tw-border-red-500 focus:tw-ring-red-500'
    if (isValid) return 'tw-border-green-500 focus:tw-ring-green-500'
    return 'tw-border-gray-300 focus:tw-ring-blue-500'
  }

  return {
    inputClass,
    labelClass,
    errorClass,
    groupClass,
    getValidationClass
  }
}

/**
 * Composable untuk dashboard layout
 */
export function useTailwindDashboard() {
  const dashboardContainer = 'tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8'
  const dashboardGrid = 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6'
  const statsGrid = 'tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6'
  const chartContainer = 'tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6'

  return {
    dashboardContainer,
    dashboardGrid,
    statsGrid,
    chartContainer
  }
}

/**
 * Master composable yang menggabungkan semua utilities
 */
export function useTailwind() {
  return {
    layout: useTailwindLayout(),
    card: useTailwindCard,
    button: useTailwindButton,
    status: useTailwindStatus,
    typography: useTailwindTypography(),
    colors: useTailwindColors(),
    loading: useTailwindLoading,
    responsive: useTailwindResponsive(),
    animation: useTailwindAnimation(),
    conditional: useTailwindConditional(),
    form: useTailwindForm(),
    dashboard: useTailwindDashboard(),
    utils: {
      cn
    }
  }
}