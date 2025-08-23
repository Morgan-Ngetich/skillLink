export interface HeadingData {
  id: string
  text: string
  level: number
}

export interface DocLink {
  title: string
  href: string
}

export interface DocSection {
  title: string
  links: DocLink[]
  collapsed?: boolean
}