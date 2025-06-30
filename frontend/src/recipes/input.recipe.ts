import { defineRecipe } from "@chakra-ui/react";

export const inputRecipe = defineRecipe({
  base: {
    fontSize: "md",
    borderRadius: "md",
    _placeholder: {
      color: "gray.500",
    },
  },
  variants: {
    style: {
      outline: {
        bg: "inputBg",
        borderColor: "inputBorder",
        _hover: {
          borderColor: "inputHoverBorder",
          bg: "inputHoverBg",
        },
        _focus: {
          borderColor: "inputFocusBorder",
          bg: "inputFocusBg",
          boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
        },
      },
      filled: {
        bg: "inputBg",
        _hover: { bg: "inputHoverBg" },
        _focus: {
          bg: "inputFocusBg",
          borderColor: "inputFocusBorder",
          boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
        },
      },
      subtle: {
        bg: "inputBg",
        _hover: { bg: "inputHoverBg" },
        _focus: {
          bg: "inputFocusBg",
          borderColor: "inputFocusBorder",
          boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
        },
      },
    },
  }
});
