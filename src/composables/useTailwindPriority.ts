/**
 * Tailwind Priority Utilities
 * Composable for ensuring Tailwind classes take priority over Bulma
 */

import { ref, computed, type Ref } from 'vue'

export function useTailwindPriority() {
  // Reactive priority classes store
  const priorityClasses = ref<Record<string, string>>({})
  
  /**
   * Get classes with Tailwind priority prefix
   * Usage: const classes = useTailwindClasses('flex items-center p-4')
   */
  const getTailwindClasses = (classes: string) => {
    return classes.split(' ').map(cls => `tw-override ${cls}`).join(' ')
  }

  /**
   * Add priority class to store
   */
  const addPriorityClass = (className: string) => {
    const key = className.replace('tw-', '')
    priorityClasses.value[key] = className
  }

  /**
   * Conditional Tailwind classes with priority
   */
  const conditionalTailwindClasses = (condition: boolean | Ref<boolean>, trueClasses: string, falseClasses: string = '') => {
    return computed(() => {
      const isTrue = typeof condition === 'boolean' ? condition : condition.value
      const selectedClasses = isTrue ? trueClasses : falseClasses
      return getTailwindClasses(selectedClasses)
    })
  }

  /**
   * Force Tailwind utility - adds tw-override class to any element
   */
  const forceTailwind = (element: HTMLElement) => {
    element.classList.add('tw-override')
  }

  /**
   * Common Tailwind class combinations for easy use
   */
  const tailwindCombinations = {
    // Layout
    flexCenter: 'tw-override flex items-center justify-center',
    flexBetween: 'tw-override flex items-center justify-between',
    flexCol: 'tw-override flex flex-col',
    gridCenter: 'tw-override grid place-items-center',
    
    // Spacing
    paddingCard: 'tw-override p-6',
    paddingSection: 'tw-override py-8 px-4',
    marginAuto: 'tw-override mx-auto',
    
    // Typography
    textCenter: 'tw-override text-center',
    textHeading: 'tw-override text-2xl font-bold',
    textSubheading: 'tw-override text-lg font-semibold',
    textMuted: 'tw-override text-gray-600',
    
    // Buttons
    btnPrimary: 'tw-override bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors',
    btnSecondary: 'tw-override bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors',
    btnDanger: 'tw-override bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors',
    
    // Cards
    cardDefault: 'tw-override bg-white rounded-lg shadow-md p-6',
    cardHover: 'tw-override bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
    
    // Forms
    inputDefault: 'tw-override w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
    labelDefault: 'tw-override block text-sm font-medium text-gray-700 mb-2',
  }

  /**
   * Get priority classes for specific elements
   */
  const getPriorityClasses = (type: keyof typeof tailwindCombinations) => {
    return tailwindCombinations[type]
  }

  /**
   * Merge custom classes with Tailwind priority
   */
  const mergeWithTailwind = (baseClasses: string, customClasses?: string) => {
    const allClasses = customClasses ? `${baseClasses} ${customClasses}` : baseClasses
    return getTailwindClasses(allClasses)
  }

  return {
    priorityClasses,
    addPriorityClass,
    getTailwindClasses,
    conditionalTailwindClasses,
    forceTailwind,
    tailwindCombinations,
    getPriorityClasses,
    mergeWithTailwind,
  }
}

/**
 * Directive for automatically applying Tailwind priority
 * Usage in template: v-tailwind-priority
 */
export const vTailwindPriority = {
  mounted(el: HTMLElement) {
    el.classList.add('tw-override')
  }
}

/**
 * Helper function to create Tailwind-first component classes
 */
export function createTailwindComponent(baseClasses: string, variants: Record<string, string> = {}) {
  return {
    base: `tw-override ${baseClasses}`,
    variants: Object.entries(variants).reduce((acc, [key, classes]) => {
      acc[key] = `tw-override ${baseClasses} ${classes}`
      return acc
    }, {} as Record<string, string>)
  }
}

/**
 * Tailwind-first class constants for common patterns
 */
export const commonClasses = {
  // Layout
  FLEX_CENTER: 'tw-flex tw-items-center tw-justify-center',
  FLEX_BETWEEN: 'tw-flex tw-items-center tw-justify-between',
  FLEX_COL: 'tw-flex tw-flex-col',
  GRID_CENTER: 'tw-grid tw-place-items-center',
  
  // Typography  
  HEADING_LG: 'tw-text-3xl tw-font-bold tw-text-gray-800',
  HEADING_MD: 'tw-text-2xl tw-font-semibold tw-text-gray-800',
  HEADING_SM: 'tw-text-lg tw-font-medium tw-text-gray-800',
  TEXT_BODY: 'tw-text-base tw-text-gray-700',
  TEXT_MUTED: 'tw-text-sm tw-text-gray-500',
  
  // Components
  CARD: 'tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6',
  BUTTON_PRIMARY: 'tw-bg-blue-500 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors hover:tw-bg-blue-600',
  BUTTON_SECONDARY: 'tw-bg-gray-200 tw-text-gray-800 tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors hover:tw-bg-gray-300',
  INPUT: 'tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500',
  
  // States
  HOVER_SCALE: 'tw-transition-transform hover:tw-scale-105',
  HOVER_SHADOW: 'tw-transition-shadow hover:tw-shadow-lg',
  FOCUS_RING: 'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2',
} as const