type Locale = 'en' | 'id'

export interface LandingNavItem {
  label: Record<Locale, string>
  to: string
  active?: boolean
}

export interface LandingFooterColumn {
  label: Record<Locale, string>
  children: {
    label: Record<Locale, string>
    to: string
  }[]
}

export interface LandingSocialItem {
  name?: string
  icon: string
  link: string
}
