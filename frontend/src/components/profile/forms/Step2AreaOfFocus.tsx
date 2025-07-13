'use client';

import {
  Box,
  Text,
  VStack,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FiCheck } from "react-icons/fi"
import { useColorModeValue } from '@/components/ui';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl } from '@chakra-ui/form-control';

// ✅ Import the new options
import { goalsFocusOptions, type AreaOfFocus } from '@/constants/goalsFocusOptions'; // <-- adjust path

export default function Step1AreaOfFocus() {
  const { control } = useFormContext();

  const selectedBg = useColorModeValue('teal.200', 'teal.900');
  const selectedIconColor = useColorModeValue('teal.800', 'teal.400');
  const iconColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <VStack align="start" gap={5} mt={8}>
      <FormControl>
        <Controller
          control={control}
          name="area_of_focus"
          render={({ field }) => {
            const selected: AreaOfFocus[] = field.value || [];

            const handleToggle = (value: AreaOfFocus) => {
              if (selected.includes(value)) {
                field.onChange(selected.filter((v) => v !== value));
              } else {
                field.onChange([...selected, value]);
              }
            };

            return (
              <Box display="flex" flexWrap="wrap" gap={4} justifyContent="flex-start">
                {goalsFocusOptions.map((option) => {
                  const isSelected = selected.includes(option.value);

                  return (
                    <Box
                      as="button"
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      borderWidth="1px"
                      borderRadius="2xl"
                      px={4}
                      py={3}
                      bg={isSelected ? selectedBg : 'transparent'}
                      borderColor={isSelected ? 'teal.500' : 'gray.200'}
                      boxShadow={isSelected ? 'md' : 'sm'}
                      _hover={{ borderColor: 'teal.400' }}
                      transition="all 0.3s"
                      textAlign="left"
                    >
                      <Flex align="center" gap={3}>
                        <Icon
                          as={isSelected ? FiCheck : option.icon}
                          boxSize={5}
                          color={isSelected ? selectedIconColor : iconColor}
                        />
                        <Text fontWeight="medium" fontSize="sm">
                          {option.label}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </Box>
            );
          }}
        />
      </FormControl>
    </VStack>
  );
}
