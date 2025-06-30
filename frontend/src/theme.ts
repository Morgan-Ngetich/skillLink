import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { buttonRecipe, inputRecipe } from "@/recipes";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "bodyBg",
      color: "bodyColor",
    },
  },

  theme: {
    semanticTokens: {
      colors: {
        bodyBg: { value: { base: "white", _dark: "gray.900" } },
        bodyColor: { value: { base: "gray.800", _dark: "whiteAlpha.900" } },
        spinnerColor: { value: { base: "teal.500", _dark: "teal.300" } },

        inputBg: { value: { base: "gray.50", _dark: "gray.700" } },
        inputHoverBg: { value: { base: "gray.100", _dark: "gray.600" } },
        inputFocusBg: { value: { base: "white", _dark: "gray.800" } },

        inputBorder: { value: { base: "gray.300", _dark: "gray.600" } },
        inputHoverBorder: { value: { base: "gray.400", _dark: "gray.800" } },
        inputFocusBorder: { value: { base: "teal.500", _dark: "teal.300" } },

        buttonSolidBg: { value: { base: "teal.500", _dark: "teal.400" } },
        buttonSolidHoverBg: { value: { base: "teal.600", _dark: "teal.500" } },
        buttonSolidActiveBg: { value: { base: "teal.700", _dark: "teal.600" } },
        buttonSolidDisabledBg: { value: { base: "teal.300", _dark: "teal.200" } },
        buttonSolidColor: { value: { base: "white", _dark: "white" } },

        buttonOutlineBorder: { value: { base: "teal.500", _dark: "teal.300" } },
        buttonOutlineColor: { value: { base: "teal.500", _dark: "teal.300" } },
        buttonOutlineHoverBg: { value: { base: "teal.50", _dark: "teal.700" } },
        buttonOutlineActiveBg: { value: { base: "teal.100", _dark: "teal.600" } },

        formBg: { value: { base: "gray.100", _dark: "gray.800" } },
        formBoxBg: { value: { base: "white", _dark: "gray.700" } },


      },
    },

    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
    },
  },
});

export default createSystem(defaultConfig, config);
