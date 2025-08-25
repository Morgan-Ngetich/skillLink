import { useMemo } from "react"
import { useRouter } from "@tanstack/react-router"
import { sidebarConfig } from "../config/sidebarConfig"

export const useBreadcrumbItems = () => {
  const router = useRouter()
  // Use the current pathname instead of basepath
  const path = router.state.location.pathname

  const breadcrumbItems = useMemo(() => {
    
    const segments = path.split("/").filter(Boolean)

    const items: {
      title: string
      url?: string
    }[] = []

    // Build breadcrumbs by finding matching paths
    const findBreadcrumbPath = (currentPath: string) => {
      for (const section of sidebarConfig) {
        for (const link of section.links) {
          // Check direct match
          if (link.href === currentPath) {
            return { title: link.title, url: link.href }
          }
          
          // Check children
          if (link.children) {
            for (const child of link.children) {
              if (child.href === currentPath) {
                return { title: child.title, url: child.href, parent: link }
              }
            }
          }
        }
      }
      return null
    }

    // Build breadcrumb trail
    let currentPath = ""
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`
      
      const match = findBreadcrumbPath(currentPath)
      if (match) {
        // If this is a child item and we haven't added its parent, add it first
        if (match.parent && !items.some(item => item.url === match.parent?.href)) {
          items.push({ title: match.parent.title, url: match.parent.href })
        }
        items.push({ title: match.title, url: match.url })
      } else {
        // Fallback for unmatched segments
        const label = segments[i]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
        items.push({ title: label, url: currentPath })
      }
    }

    return items.slice(2)
  }, [path])

  return breadcrumbItems
}