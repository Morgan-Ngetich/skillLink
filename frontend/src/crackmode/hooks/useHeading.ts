import { useEffect, useState } from "react"
import type { HeadingData } from "../types/docs"
import slugify from "slugify"

export function useHeadings(): HeadingData[] {
  const [headings, setHeadings] = useState<HeadingData[]>([])

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("h2, h3, h4")
    ) as HTMLElement[]

    const mapped = elements.map((el) => ({
      id: el.id || slugify(el.innerText, { lower: true, strict: true }),
      text: el.innerText,
      level: Number(el.tagName.replace("H", "")),
    }))

    setHeadings(mapped)
  }, [])

  return headings
}
