import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
// import { defineRecipe } from "@chakra-ui/react";
import { inputRecipe } from "@/recipes/input.recipe"

// Define the Button recipe
// const buttonRecipe = defineRecipe({
//   base: {
//     borderRadius: "lg", // Apply large border radius
//   },
// });


const config = defineConfig({
  globalCss: {
    body: {
      bg: "white",
      color: "gray.800",
      _dark: {
        bg: "gray.900",
        color: "whiteAlpha.900",
      },
    },
  },

  theme: {
    semanticTokens: {
      colors: {
        bodyBg: {
          value: { DEFAULT: "white", _dark: "gray.800" },
        },

        bodyColor: {
          value: { DEFAULT: "gray.800", _dark: "whiteAlpha.900" },
        },
        cardbg: {
          DEFAULT: {
            value: {
              base: "{colors.gray.50}",
              _dark: "{colors.gray.800}",
            },
          },
          // subtle: { value: "{colors.gray.100}" },
          // strong: { value: "{colors.gray.200}" },
        },
      },
    },

    // Define recipes for components
    recipes: {
      // button: buttonRecipe,
      input: inputRecipe
    },
  },
});

const themeSystem = createSystem(defaultConfig, config);
export default themeSystem;
