import { chakra } from "@chakra-ui/react";
import { inputRecipe } from "@/recipes/input.recipe";

export const StyledInput = chakra("input", inputRecipe);


export const StyledTextarea = chakra("textarea", {
  base: {
    ...inputRecipe.base,
    minH: "100px", // make it taller by default for typing
    resize: "vertical", // allow resizing
  },
});