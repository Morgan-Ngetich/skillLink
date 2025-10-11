import {
  Box,
  Text,
  VStack,
  Icon,
  Flex,
  Button,
  Collapsible,
  HStack,
  InputGroup,
} from '@chakra-ui/react';
import { Alert } from '@/components/ui';
import { StyledInput } from '@/components/ui';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { FiCheck, FiPlus, FiX, FiTarget } from 'react-icons/fi';
import {
  focusDetailsMap,
  type AreaOfFocus,
  type FocusTag,
} from '@/constants/goalsFocusOptions';
import { useState } from 'react';

export default function Step3Goals() {
  const { control, setValue } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  const selectedAreas = useWatch({ control, name: 'area_of_focus' }) || [];
  const selectedGoals = useWatch({ control, name: 'goals' }) || [];

  // Get goal suggestions based on selected focus areas
  const goalSuggestions: FocusTag[] = Array.from(
    new Set(
      (selectedAreas as AreaOfFocus[])
        .flatMap(area => focusDetailsMap[area] || [])
        .filter(tag => tag.type === 'goal')
        .map(tag => JSON.stringify(tag))
    )
  ).map(str => JSON.parse(str));

  // Custom goals that aren't in suggestions
  const customGoals: FocusTag[] = selectedGoals
    .filter((label: string) => !goalSuggestions.some(tag => tag.label === label))
    .map((label: string) => ({ label, type: 'goal' as const }));

  const allGoals = [...goalSuggestions, ...customGoals];
  const missingGoals = Math.max(0, 3 - selectedGoals.length);
  const isValid = missingGoals === 0;

  const selectedBg = { base: 'teal.200', _dark: 'teal.900' }
  const selectedIconColor = { base: 'teal.800', _dark: 'teal.400' }
  const iconColor = { base: 'gray.500', _dark: 'gray.400' }

  const toggleGoal = (goalLabel: string) => {
    const updated = selectedGoals.includes(goalLabel)
      ? selectedGoals.filter((l: string) => l !== goalLabel)
      : [...selectedGoals, goalLabel];

    setValue('goals', updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const addCustomGoal = () => {
    const value = customInputValue.trim();
    if (!value || selectedGoals.includes(value)) return;

    setValue('goals', [...selectedGoals, value], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setCustomInputValue('');
    setIsOpen(false);
  };

  return (
    <VStack align="start" gap={6} w="full">
      {/* Header */}
      {/* <Box>
        <Text fontSize="md" color="fg.info">
          Select at least 2 goals. These will help us match you with relevant opportunities and connections.
        </Text>
      </Box> */}

      {/* Validation Alert */}
      {!isValid && (
        <Alert status="warning" borderRadius="md" fontSize="sm">
          Please select at least {missingGoals} more goal{missingGoals > 1 ? 's' : ''} to continue.
        </Alert>
      )}

      {/* Goals Selection */}
      <FormControl w="full">
        <Controller
          control={control}
          name="goals"
          render={() => (
            <Box>
              {allGoals.length > 0 ? (
                <Flex
                  flexWrap="wrap"
                  gap={4}
                  maxH="400px"
                  overflowY="auto"
                  p={2}
                >
                  {allGoals.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.label);
                    const isCustom = !goalSuggestions.some(sg => sg.label === goal.label);

                    return (
                      <Box
                        as="button"
                        key={goal.label}
                        onClick={() => toggleGoal(goal.label)}
                        borderWidth="1px"
                        borderRadius="xl"
                        px={4}
                        py={3}
                        bg={isSelected ? selectedBg : 'transparent'}
                        borderColor={isSelected ? 'teal.400' : 'gray.200'}
                        boxShadow={isSelected ? 'md' : 'sm'}
                        _hover={{
                          borderColor: 'teal.300',
                          transform: 'translateY(-1px)',
                          boxShadow: 'lg'
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                        userSelect="none"
                        position="relative"
                      >
                        <Flex align="center" gap={3}>
                          <Icon
                            as={isSelected ? FiCheck : FiTarget}
                            boxSize={4}
                            color={isSelected ? selectedIconColor : iconColor}
                          />
                          <Text
                            fontWeight={isSelected ? "semibold" : "medium"}
                            fontSize="sm"
                            // color={isSelected ? "fg.muted" : ""}
                          >
                            {goal.label}
                          </Text>
                          {isCustom && (
                            <Box
                              position="absolute"
                              top="-2"
                              right="-2"
                              bg="blue.focusRing"
                              color="white"
                              borderRadius="full"
                              w="5"
                              h="5"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              +
                            </Box>
                          )}
                        </Flex>
                      </Box>
                    );
                  })}
                </Flex>
              ) : (
                <Box
                  p={8}
                  textAlign="center"
                  borderRadius="lg"
                  bg="gray.50"
                  _dark={{ bg: 'gray.800' }}
                >
                  <Icon as={FiTarget} boxSize={8} color="gray.400" mb={3} />
                  <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                    No goal suggestions available. Add your own goals below!
                  </Text>
                </Box>
              )}
            </Box>
          )}
        />
      </FormControl>

      {/* Custom Goal Input */}
      <Collapsible.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)} w="full">
        {!isOpen && (
          <Collapsible.Trigger asChild>
            <Button
              size="sm"
              variant="outline"
              colorPalette="teal"
            >
              <FiPlus />  Add Custom Goal
            </Button>
          </Collapsible.Trigger>
        )}

        <Collapsible.Content>
          <VStack align="start" gap={3} mt={4} p={4} bg="teal.50" _dark={{ bg: 'teal.900/20' }} borderRadius="lg">
            <FormControl w="100%">
              <FormLabel fontSize="sm" mb={2}>
                Add your own goal
              </FormLabel>
              <HStack>
                <InputGroup
                  endElement={
                    <HStack>
                      <Button
                        size="sm"
                        colorPalette="teal"
                        onClick={addCustomGoal}
                        disabled={!customInputValue.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        aria-label="Close"
                        onClick={() => {
                          setIsOpen(false);
                          setCustomInputValue('');
                        }}
                      >
                        <FiX />
                      </Button>
                    </HStack>
                  }
                >
                  <StyledInput
                    placeholder="Enter your custom goal..."
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomGoal();
                      }
                    }}
                  />
                </InputGroup>
              </HStack>
            </FormControl>
          </VStack>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Progress Indicator */}
      <Box w="full" p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="lg">
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
            Goals selected: {selectedGoals.length} / 3 minimum
          </Text>
          <Box
            w="100px"
            h="2"
            bg="gray.200"
            _dark={{ bg: 'gray.600' }}
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              w={`${Math.min(100, (selectedGoals.length / 3) * 100)}%`}
              h="full"
              bg="teal.400"
              transition="width 0.3s"
            />
          </Box>
        </HStack>
      </Box>
    </VStack>
  );
}