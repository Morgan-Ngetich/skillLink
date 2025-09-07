import { createShikiAdapter } from "@chakra-ui/react"
import type { Highlighter } from "shiki"

// Cache the promise instead of the instance to avoid race conditions
let highlighterPromise: Promise<Highlighter> | null = null

export const shikiAdapter = createShikiAdapter<Highlighter>({
  async load() {
    // Return existing promise if it exists
    if (highlighterPromise) {
      return highlighterPromise
    }

    highlighterPromise = (async () => {
      const { createHighlighter } = await import("shiki")
      const highlighter = await createHighlighter({
        langs: [
          "tsx",
          "ts",
          "js",
          "python",
          "c++",
          "java",
          "json",
          "bash",
          "html",
          "css",
          "scss"
        ],
        themes: ["github-dark", "github-light"],
      })
      return highlighter
    })()

    return highlighterPromise
  },
  theme: {
    light: "github-light",
    dark: "github-dark"
  }
})

// Cleanup function
export const disposeShikiHighlighter = async () => {
  if (highlighterPromise) {
    const highlighter = await highlighterPromise
    highlighter.dispose()
    highlighterPromise = null
  }
}