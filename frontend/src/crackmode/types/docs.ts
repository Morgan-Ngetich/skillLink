export interface HeadingData {
  id: string
  text: string
  level: number
}

interface Children {
  title: string
  href: string
}

export interface DocLink {
  title: string
  href: string
  children?: Children[]
}

export interface DocSection {
  title: string
  links: DocLink[]
  collapsed?: boolean
}

export interface BreadcrumbItem {
  title: string;
  url?: string;
  position?: number
}