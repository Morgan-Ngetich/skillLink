'use client';

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
  TagLabel,
  SegmentGroup,
} from '@chakra-ui/react';
import { Alert, Tag } from '@/components/ui';
import { StyledInput, useColorModeValue } from '@/components/ui';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { FiCheck, FiPlus, FiX } from 'react-icons/fi';
import {
  focusDetailsMap,
  type AreaOfFocus,
  type FocusTag,
} from '@/constants/goalsFocusOptions';
import { useState } from 'react';

export default function Step3GoalsInterests() {
  const { control, getValues, setValue } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [customType, setCustomType] = useState<'goal' | 'interest'>('goal');
  const [customInputValue, setCustomInputValue] = useState('');


  const selectedAreas = useWatch({ control, name: 'area_of_focus' }) || [];

  const suggestions: FocusTag[] = Array.from(
    new Set(
      (selectedAreas as AreaOfFocus[])
        .flatMap(area => focusDetailsMap[area] || [])
        .map(tag => JSON.stringify(tag))
    )
  ).map(str => JSON.parse(str));

  const selectedBg = useColorModeValue('teal.200', 'teal.900');
  const selectedIconColor = useColorModeValue('teal.800', 'teal.400');
  const iconColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <VStack align="start" gap={5}>
      <FormControl w='100%'>
        <Controller
          control={control}
          name="goals"
          render={({ field: goalsField }) => (
            <Controller
              control={control}
              name="interests"
              render={({ field: interestsField }) => {
                const selectedGoals = goalsField.value || [];
                const selectedInterests = interestsField.value || [];

                const suggestionLabels = suggestions.map(tag => tag.label)
                const customTags: FocusTag[] = [
                  ...selectedGoals
                    .filter((label: string) => !suggestionLabels.includes(label))
                    .map((label: string) => ({ label, type: 'goal' })),
                  ...selectedInterests
                    .filter((label: string) => !suggestionLabels.includes(label))
                    .map((label: string) => ({ label, type: 'interest' })),
                ];

                const isSelected = (tag: FocusTag) =>
                  tag.type === 'goal'
                    ? selectedGoals.includes(tag.label)
                    : selectedInterests.includes(tag.label);

                const toggleTag = (tag: FocusTag) => {
                  const isGoal = tag.type === 'goal';
                  const current = isGoal ? selectedGoals : selectedInterests;
                  const updated = current.includes(tag.label)
                    ? current.filter((l: string) => l !== tag.label)
                    : [...current, tag.label];

                  if (isGoal) {
                    goalsField.onChange(updated);
                  } else {
                    interestsField.onChange(updated);
                  }
                };

                const missingGoals = Math.max(0, 2 - (selectedGoals?.length ?? 0));
                const missingInterests = Math.max(0, 2 - (selectedInterests?.length ?? 0));

                const isValid = missingGoals === 0 && missingInterests === 0;

                const isCustom = (tag: FocusTag) => {
                  return !suggestionLabels.includes(tag.label);
                }


                return (
                  <>
                    {!isValid && (
                      <Alert status="warning" borderRadius="md" fontSize="sm">
                        Please select at least{' '}
                        {missingGoals > 0 && `${missingGoals} more goal${missingGoals > 1 ? 's' : ''}`}
                        {missingGoals > 0 && missingInterests > 0 && ' and '}
                        {missingInterests > 0 && `${missingInterests} more interest${missingInterests > 1 ? 's' : ''}`}.
                      </Alert>
                    )}

                    <Flex
                      flexWrap="wrap"
                      gap={4}
                      maxH="calc(100vh - 400px)"
                      overflowY="auto"
                      mt={isValid ? 4 : 1}
                    >
                      {Array.from(
                        new Map(
                          [...suggestions, ...customTags].map((tag) => [tag.label, tag])
                        ).values()
                      ).map((tag) => {
                        const active = isSelected(tag);
                        return (
                          <Box
                            as="button"
                            key={tag.label}
                            onClick={() => toggleTag(tag)}
                            borderWidth="1px"
                            borderRadius="2xl"
                            pl={4}
                            pr={2}
                            py={3}
                            bg={active ? selectedBg : 'transparent'}
                            borderColor={active ? 'teal.500' : 'gray.200'}
                            boxShadow={active ? 'md' : 'sm'}
                            _hover={{ borderColor: 'teal.400' }}
                            transition="all 0.3s"
                            textAlign="left"
                            cursor="pointer"
                            userSelect="none"
                          >
                            <Flex align="center" gap={3}>
                              <Icon
                                as={active ? FiCheck : FiPlus}
                                boxSize={5}
                                color={active ? selectedIconColor : iconColor}
                              />
                              <HStack align="start" gap={1}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {tag.label}
                                </Text>
                                <Tag
                                  size="sm"
                                  colorPalette={
                                    tag.type === 'goal'
                                      ? 'green'
                                      : 'blue'
                                  }
                                  variant={isCustom(tag) ? 'solid' : 'subtle'}
                                >
                                  <TagLabel textTransform="capitalize">
                                    {tag.type}
                                  </TagLabel>
                                </Tag>
                              </HStack>
                            </Flex>
                          </Box>
                        );
                      })}
                    </Flex>
                  </>
                );
              }}
            />
          )}
        />
      </FormControl>

      {/* Custom goal input */}
      <Collapsible.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)} w="full">
        {!isOpen && (
          <Collapsible.Trigger asChild>
            <Button size="sm">Other</Button>
          </Collapsible.Trigger>
        )}

        <Collapsible.Content>
          <VStack align="start" gap={4} mt={4}>
            <SegmentGroup.Root
              value={customType}
              onValueChange={(val) => {
                const strVal = typeof val === 'string' ? val : val?.value;
                if (strVal === 'goal' || strVal === 'interest') {
                  setCustomType(strVal);
                }
              }}
            >
              <SegmentGroup.Indicator colorPalette={'green'} />
              <SegmentGroup.Items
                items={[
                  { value: 'goal', label: 'Goal' },
                  { value: 'interest', label: 'Interest' },
                ]}
                colorPalette={'green'}
              />
            </SegmentGroup.Root>

            {/* <Controller
              control={control}
              name="customInput"
              render={({ field }) => ( */}
            <FormControl w="100%">
              <FormLabel fontSize="sm" mb="0">
                Add your own {customType}
              </FormLabel>
              <HStack>
                <InputGroup
                  endElement={
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="red"
                      aria-label="Close"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiX />
                    </Button>
                  }
                >
                  <StyledInput
                    placeholder={`Enter a custom ${customType}...`}
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = customInputValue.trim();
                        if (!value) return;

                        const fieldName = customType === 'goal' ? 'goals' : 'interests';
                        const current = getValues(fieldName) || [];

                        if (!current.includes(value)) {
                          setValue(fieldName, [...current, value], {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }

                        setCustomInputValue('');
                        setIsOpen(false);
                      }
                    }}
                  />
                </InputGroup>
              </HStack>
            </FormControl>
            {/* )}
            /> */}
          </VStack>
        </Collapsible.Content>
      </Collapsible.Root>

    </VStack>
  );
}
