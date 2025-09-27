/**
 * Tailwind CSS Utility Functions
 * Helper functions untuk mempermudah penggunaan Tailwind CSS
 */

/**
 * Conditional class utility - untuk menggabungkan classes secara conditional
 * @param classes - Array of conditional classes
 * @returns Combined class string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Color palette utilities untuk konsistensi warna
 */
export const colors = {
  primary: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
  },
  success: {
    50: 'bg-green-50',
    100: 'bg-green-100', 
    500: 'bg-green-500',
    600: 'bg-green-600',
    700: 'bg-green-700',
  },
  warning: {
    50: 'bg-yellow-50',
    100: 'bg-yellow-100',
    500: 'bg-yellow-500',
    600: 'bg-yellow-600',
    700: 'bg-yellow-700',
  },
  danger: {
    50: 'bg-red-50',
    100: 'bg-red-100',
    500: 'bg-red-500',
    600: 'bg-red-600',
    700: 'bg-red-700',
  },
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  }
} as const

/**
 * Animation utilities
 */
export const animations = {
  fadeIn: 'tw-animate-fade-in',
  fadeOut: 'tw-animate-fade-out',
  slideIn: 'tw-animate-slide-in',
  slideOut: 'tw-animate-slide-out',
  pulse: 'tw-animate-pulse',
  spin: 'tw-animate-spin',
  ping: 'tw-animate-ping',
  bounce: 'tw-animate-bounce',
} as const

/**
 * Shadow utilities
 */
export const shadows = {
  sm: 'tw-shadow-sm',
  base: 'tw-shadow',
  md: 'tw-shadow-md',
  lg: 'tw-shadow-lg',
  xl: 'tw-shadow-xl',
  '2xl': 'tw-shadow-2xl',
  none: 'tw-shadow-none',
} as const

/**
 * Layout utilities untuk dashboard
 */
export const layouts = {
  container: 'tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8',
  grid: {
    cols1: 'tw-grid tw-grid-cols-1 tw-gap-6',
    cols2: 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6',
    cols3: 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6',
    cols4: 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6',
  },
  flex: {
    center: 'tw-flex tw-items-center tw-justify-center',
    between: 'tw-flex tw-items-center tw-justify-between',
    start: 'tw-flex tw-items-center tw-justify-start',
    end: 'tw-flex tw-items-center tw-justify-end',
    col: 'tw-flex tw-flex-col',
    colCenter: 'tw-flex tw-flex-col tw-items-center tw-justify-center',
  }
} as const

/**
 * Card component utilities
 */
export const cardStyles = {
  base: 'tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6',
  hover: 'tw-transition-all tw-duration-300 hover:tw-shadow-lg hover:tw-scale-105',
  bordered: 'tw-border tw-border-gray-200',
  interactive: 'tw-cursor-pointer tw-transition-all tw-duration-200 hover:tw-shadow-lg',
} as const

/**
 * Button utilities
 */
export const buttonStyles = {
  primary: 'tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-duration-200 hover:tw-bg-blue-700',
  secondary: 'tw-bg-gray-200 tw-text-gray-800 tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-duration-200 hover:tw-bg-gray-300',
  success: 'tw-bg-green-600 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-duration-200 hover:tw-bg-green-700',
  danger: 'tw-bg-red-600 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-duration-200 hover:tw-bg-red-700',
  ghost: 'tw-bg-transparent tw-text-gray-600 tw-px-4 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-duration-200 hover:tw-bg-gray-100',
} as const

/**
 * Form utilities
 */
export const formStyles = {
  input: 'tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-focus:tw-outline-none tw-focus:tw-ring-2 tw-focus:tw-ring-blue-500 tw-focus:tw-border-transparent',
  label: 'tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2',
  error: 'tw-text-red-600 tw-text-sm tw-mt-1',
  group: 'tw-mb-4',
} as const

/**
 * Status indicators
 */
export const statusStyles = {
  success: 'tw-bg-green-100 tw-text-green-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium',
  warning: 'tw-bg-yellow-100 tw-text-yellow-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium',
  danger: 'tw-bg-red-100 tw-text-red-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium',
  info: 'tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium',
  neutral: 'tw-bg-gray-100 tw-text-gray-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium',
} as const

/**
 * Typography utilities
 */
export const typography = {
  h1: 'tw-text-4xl tw-font-bold tw-text-gray-900',
  h2: 'tw-text-3xl tw-font-bold tw-text-gray-900',
  h3: 'tw-text-2xl tw-font-bold tw-text-gray-900',
  h4: 'tw-text-xl tw-font-bold tw-text-gray-900',
  h5: 'tw-text-lg tw-font-bold tw-text-gray-900',
  h6: 'tw-text-base tw-font-bold tw-text-gray-900',
  body: 'tw-text-base tw-text-gray-700',
  small: 'tw-text-sm tw-text-gray-600',
  caption: 'tw-text-xs tw-text-gray-500',
  muted: 'tw-text-gray-500',
} as const

/**
 * Responsive utilities
 */
export const responsive = {
  hide: {
    sm: 'tw-hidden sm:tw-block',
    md: 'tw-hidden md:tw-block', 
    lg: 'tw-hidden lg:tw-block',
    xl: 'tw-hidden xl:tw-block',
  },
  show: {
    sm: 'tw-block sm:tw-hidden',
    md: 'tw-block md:tw-hidden',
    lg: 'tw-block lg:tw-hidden', 
    xl: 'tw-block xl:tw-hidden',
  }
} as const

/**
 * Helper function untuk membuat class conditional berdasarkan props
 */
export function getVariantClasses(variant: string, baseClasses: Record<string, string>): string {
  return baseClasses[variant] || baseClasses.default || ''
}

/**
 * Helper function untuk dark mode classes
 */
export function darkMode(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass.replace('tw-', 'tw-')}`
}

/**
 * Helper function untuk loading state
 */
export function loadingClasses(isLoading: boolean): string {
  return isLoading ? 'tw-animate-pulse tw-pointer-events-none tw-opacity-50' : ''
}

/**
 * Helper function untuk responsive text sizes
 */
export function responsiveText(size: 'sm' | 'base' | 'lg' | 'xl'): string {
  const sizes = {
    sm: 'tw-text-sm sm:tw-text-base',
    base: 'tw-text-base sm:tw-text-lg',
    lg: 'tw-text-lg sm:tw-text-xl',
    xl: 'tw-text-xl sm:tw-text-2xl'
  }
  return sizes[size]
}

/**
 * Helper function untuk spacing yang konsisten
 */
export const spacing = {
  xs: 'tw-space-y-1',
  sm: 'tw-space-y-2',
  base: 'tw-space-y-4',
  lg: 'tw-space-y-6',
  xl: 'tw-space-y-8',
  '2xl': 'tw-space-y-12',
} as const