import { createShikiAdapter } from "@chakra-ui/react"
import type { Highlighter } from "shiki"

export const shikiAdapter = createShikiAdapter<Highlighter>({
  async load() {
    const { createHighlighter } = await import("shiki")
    return createHighlighter({
      langs: ["tsx", "js", "json", "bash", "html", "css"],
      themes: ["github-dark", "github-light"],
    })
  },
})
