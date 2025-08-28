import { useMemo } from "react"
import { useRouter } from "@tanstack/react-router"
import { sidebarConfig } from "../config/sidebarConfig"
import type { BreadcrumbItem } from "../types/docs"

export const useBreadcrumbItems = () => {
  const router = useRouter()
  // Use the current pathname instead of basepath
  const path = router.state.location.pathname

  const breadcrumbItems = useMemo(() => {
    const segments = path.split("/").filter(Boolean)
    const items: BreadcrumbItem[] = []

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
          items.push({
            title: match.parent.title,
            url: match.parent.href,
            position: items.length + 2 // Start from 2 since Home is position 1
          })
        }
        items.push({
          title: match.title,
          url: match.url,
          position: items.length + 2
        })
      } else {
        // Fallback for unmatched segments
        const label = segments[i]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
        items.push({
          title: label,
          url: currentPath,
          position: items.length + 2
        })
      }
    }

    return items.slice(2) // For display (remove /crackmode/docs)
  }, [path])

  // For structured data, include the full path including Home
  const structuredDataItems = useMemo(() => {
    const fullItems: BreadcrumbItem[] = [
      // { title: "Home", url: "/", position: 1},
      { title: "CrackMode", url: "/crackmode", position: 1 },
      ...breadcrumbItems
    ]
    return fullItems
  }, [breadcrumbItems])

  return {
    displayItems: breadcrumbItems,
    structuredDataItems
  }
}