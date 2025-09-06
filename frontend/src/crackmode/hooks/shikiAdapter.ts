import { createShikiAdapter } from "@chakra-ui/react"
import type { Highlighter } from "shiki"

export const shikiAdapter = createShikiAdapter<Highlighter>({
  async load() {
    const { createHighlighter } = await import("shiki")
    return createHighlighter({
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
  },
  // Support both light and dark themes
  theme: {
    light: "github-light",
    dark: "github-dark"
  }
})