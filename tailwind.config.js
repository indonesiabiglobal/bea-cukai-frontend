/** @type {import('tailwindcss').Config} */
export default {
  important: true, // Force Tailwind to use !important for higher priority over Bulma
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./documentation/**/*.{vue,js,ts,jsx,tsx,md}"
  ],
  theme: {
    extend: {
      // Extend Tailwind colors to work alongside Bulma
      colors: {
        // Bulma primary colors integration
        'bulma-primary': 'var(--primary)',
        'bulma-info': 'var(--info)',
        'bulma-success': 'var(--success)',
        'bulma-warning': 'var(--warning)',
        'bulma-danger': 'var(--danger)',
        'bulma-dark': 'var(--dark)',
        'bulma-light': 'var(--light)',
        'bulma-white': 'var(--white)',
        'bulma-black': 'var(--black)',
        
        // Custom project colors from CSS variables
        'dark-text': 'var(--dark-text)',
        'light-text': 'var(--light-text)',
        'muted-grey': 'var(--muted-grey)',
        'fade-grey': 'var(--fade-grey)',
        'placeholder': 'var(--placeholder)',
        'border-color': 'var(--border)',
        'background': 'var(--background)',
        'card-bg': 'var(--card-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
      },
      fontFamily: {
        'primary': 'var(--font)',
        'alt': 'var(--font-alt)',
        'mono': 'var(--font-mono)',
      },
      spacing: {
        // Add custom spacing that matches Bulma
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': 'var(--light-box-shadow)',
        'card-hover': 'var(--light-box-shadow-hover)',
      },
    },
  },
  plugins: [],
  // Enable important to prioritize Tailwind over Bulma when conflicts occur
  // Disable preflight to avoid conflicts with Bulma's base styles
  corePlugins: {
    preflight: false,
  },
}