import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "white",
      color: "gray.800",
      _dark: {
        bg: "gray.800",
        color: "whiteAlpha.900",
      },
    },
  },

  theme: {
    semanticTokens: {
      colors: {
        bodyBg: {
          value: { DEFAULT: "white", _dark: "gray.800" }
        },

        bodyColor: {
          value: { DEFAULT: "gray.800", _dark: "whiteAlpha.900" }
        },
      },
    },
  },
});

const themeSystem = createSystem(defaultConfig, config);
export default themeSystem;
