import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import type { ColorMode } from "./color-mode"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const colorMode = (forcedTheme || resolvedTheme || "dark") as ColorMode
  
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  
  return {
    colorMode: mounted ? colorMode : "dark", // Default to dark during SSR
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR or before hydration, return dark value
  if (!mounted) {
    return dark
  }

  return colorMode === "dark" ? dark : light
}