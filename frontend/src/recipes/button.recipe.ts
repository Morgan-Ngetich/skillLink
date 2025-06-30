import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "semibold",
  },
  variants: {
    visual: {
      solid: {
        bg: "buttonSolidBg",
        color: "white",
        _hover: { bg: "buttonSolidHoverBg" },
        _active: { bg: "buttonSolidActiveBg" },
      },
      outline: {
        borderColor: "buttonOutlineBorder",
        color: "buttonOutlineColor",
        _hover: { bg: "buttonOutlineHoverBg" },
        _active: { bg: "buttonOutlineActiveBg" },
      },
    },
  },
  defaultVariants: {
    visual: "solid",
  },
});

