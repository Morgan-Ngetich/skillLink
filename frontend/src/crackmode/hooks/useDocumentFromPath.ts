import { useState, useEffect } from "react"
import { useRouter } from "@tanstack/react-router"
import { type EnhancedSearchableDoc } from "../types/search"
import SearchData from "@/crackmode/data/searchData.json"

// In useDocumentFromPath.ts
export function useDocumentFromPath(): EnhancedSearchableDoc | undefined {
  const router = useRouter()
  const pathname = router.state.location.pathname

  const [doc, setDoc] = useState<EnhancedSearchableDoc | undefined>()

  useEffect(() => {
    // Find the document that matches the current path
    const foundDoc = SearchData.find((item: EnhancedSearchableDoc) => {
      return item.url === pathname || pathname.endsWith(item.url)
    })
    setDoc(foundDoc)
  }, [pathname])

  return doc
}