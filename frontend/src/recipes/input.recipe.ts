import { defineRecipe } from '@chakra-ui/react';

export const inputRecipe = defineRecipe({
  className: 'input',
  base: {
    minH: "50px",
    borderRadius: '2xl',
    w: 'full',
    border: '1px solid',
    borderColor: { base: 'gray.200', _dark: 'gray.600' },
    bg: { base: 'gray.200', _dark: 'gray.700' },
    _hover: {
      bg: { base: 'gray.100', _dark: 'gray.600' },
    },
    _focus: {
      bg: { base: 'white', _dark: 'gray.800' },
      borderColor: { base: 'teal.500', _dark: 'teal.300' },
      boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)',
    },
    px: 4,
    py: 2,
    fontSize: 'sm',
    transition: 'all 0.2s ease',
  },
});
