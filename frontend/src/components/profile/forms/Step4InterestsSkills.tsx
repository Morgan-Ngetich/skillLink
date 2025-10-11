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
  Tabs,
} from '@chakra-ui/react';
import { Alert, Tag } from '@/components/ui';
import { StyledInput } from '@/components/ui';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { FiCheck, FiPlus, FiX, FiHeart, FiTool } from 'react-icons/fi';
import {
  focusDetailsMap,
  type AreaOfFocus,
  type FocusTag,
} from '@/constants/goalsFocusOptions';
import { useState } from 'react';

export default function Step4InterestsSkills() {
  const { control, getValues, setValue } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [customType, setCustomType] = useState<'interest' | 'skill'>('interest');
  const [customInputValue, setCustomInputValue] = useState('');

  const selectedAreas = useWatch({ control, name: 'area_of_focus' }) || [];
  const selectedInterests = useWatch({ control, name: 'interests' }) || [];
  const selectedSkills = useWatch({ control, name: 'skills' }) || [];

  // Get suggestions based on selected focus areas
  const suggestions: FocusTag[] = Array.from(
    new Set(
      (selectedAreas as AreaOfFocus[])
        .flatMap(area => focusDetailsMap[area] || [])
        .filter(tag => tag.type === 'interest' || tag.type === 'skill')
        .map(tag => JSON.stringify(tag))
    )
  ).map(str => JSON.parse(str));

  const interestSuggestions = suggestions.filter(tag => tag.type === 'interest');
  const skillSuggestions = suggestions.filter(tag => tag.type === 'skill');

  // Custom items
  const customInterests: FocusTag[] = selectedInterests
    .filter((label: string) => !interestSuggestions.some(tag => tag.label === label))
    .map((label: string) => ({ label, type: 'interest' as const }));

  const customSkills: FocusTag[] = selectedSkills
    .filter((label: string) => !skillSuggestions.some(tag => tag.label === label))
    .map((label: string) => ({ label, type: 'skill' as const }));

  const allInterests = [...interestSuggestions, ...customInterests];
  const allSkills = [...skillSuggestions, ...customSkills];

  const missingInterests = Math.max(0, 2 - selectedInterests.length);
  const missingSkills = Math.max(0, 1 - selectedSkills.length);
  const isValid = missingInterests === 0 && missingSkills === 0;

  const selectedBg = { base: 'teal.100', _dark: 'teal.900' };
  const selectedIconColor = { base: 'teal.700', _dark: 'teal.300' };
  const iconColor = { base: 'gray.500', _dark: 'gray.400' };

  const toggleItem = (label: string, type: 'interest' | 'skill') => {
    const fieldName = type === 'interest' ? 'interests' : 'skills';
    const current = getValues(fieldName) || [];
    const updated = current.includes(label)
      ? current.filter((l: string) => l !== label)
      : [...current, label];

    setValue(fieldName, updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const addCustomItem = () => {
    const value = customInputValue.trim();
    if (!value) return;

    const fieldName = customType === 'interest' ? 'interests' : 'skills';
    const current = getValues(fieldName) || [];

    if (!current.includes(value)) {
      setValue(fieldName, [...current, value], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    setCustomInputValue('');
    setIsOpen(false);
  };

  const renderSection = (
    items: FocusTag[],
    type: 'interest' | 'skill',
    selected: string[],
    icon: React.ComponentType,
    colorScheme: string
  ) => (
    <Box>

      {items.length > 0 ? (
        <Flex flexWrap="wrap" gap={3} maxH="300px" overflowY="auto" py={2}>
          {items.map((item) => {
            const isSelected = selected.includes(item.label);
            const isCustom = type === 'interest'
              ? !interestSuggestions.some(s => s.label === item.label)
              : !skillSuggestions.some(s => s.label === item.label);

            return (
              <Box
                as="button"
                key={item.label}
                onClick={() => toggleItem(item.label, type)}
                borderWidth="1px"
                borderRadius="xl"
                px={4}
                py={3}
                bg={isSelected ? selectedBg : 'transparent'}
                borderColor={isSelected ? `${colorScheme}.400` : 'gray.200'}
                boxShadow={isSelected ? 'md' : 'sm'}
                _hover={{
                  borderColor: `${colorScheme}.300`,
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
                    as={isSelected ? FiCheck : icon}
                    boxSize={4}
                    color={isSelected ? selectedIconColor : iconColor}
                  />
                  <Text
                    fontWeight={isSelected ? "semibold" : "medium"}
                    fontSize="sm"
                  >
                    {item.label}
                  </Text>
                  {isCustom && (
                    <Box
                      position="absolute"
                      top="-2"
                      right="-2"
                      bg="pink.500"
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
          p={6}
          textAlign="center"
          borderRadius="lg"
          bg="gray.50"
          _dark={{ bg: 'gray.800' }}
        >
          <Icon as={icon} boxSize={6} color="gray.400" mb={2} />
          <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
            No {type} suggestions available. Add your own below!
          </Text>
        </Box>
      )}
    </Box>
  );

  return (
    <VStack align="start" gap={8} w="full">
      {/* Header */}
      {/* <Box>
        <Text fontSize="md" color="gray.600" _dark={{ color: 'gray.300' }}>
          Tell us about your interests and skills. We need at least 2 interests and 1 skill to help match you with the right opportunities.
        </Text>
      </Box> */}

      {/* Validation Alert */}
      {!isValid && (
        <Alert status="warning" borderRadius="md" fontSize="sm">
          Please select at least{' '}
          {missingInterests > 0 && `${missingInterests} more interest${missingInterests > 1 ? 's' : ''}`}
          {missingInterests > 0 && missingSkills > 0 && ' and '}
          {missingSkills > 0 && `${missingSkills} more skill${missingSkills > 1 ? 's' : ''}`}.
        </Alert>
      )}

      {/* Tabs for Interests and Skills */}
      <Tabs.Root defaultValue="interests" w="full" variant="outline">
        <Tabs.List>
          <Tabs.Trigger value="interests">
            <HStack>
              <FiHeart />
              <Text>Interests</Text>
              <Tag size="sm" colorPalette="pink">
                <TagLabel>{selectedInterests.length}</TagLabel>
              </Tag>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="skills">
            <HStack>
              <FiTool />
              <Text>Skills</Text>
              <Tag size="sm" colorPalette="green">
                <TagLabel>{selectedSkills.length}</TagLabel>
              </Tag>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="interests" p={4}>
          <FormControl>
            <Controller
              control={control}
              name="interests"
              render={() => renderSection(allInterests, 'interest', selectedInterests, FiHeart, 'pink')}
            />
          </FormControl>
        </Tabs.Content>

        <Tabs.Content value="skills" p={4}>
          <FormControl>
            <Controller
              control={control}
              name="skills"
              render={() => renderSection(allSkills, 'skill', selectedSkills, FiTool, 'green')}
            />
          </FormControl>
        </Tabs.Content>
      </Tabs.Root>

      {/* Custom Input */}
      <Collapsible.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)} w="full">
        {!isOpen && (
          <Collapsible.Trigger asChild>
            <Button
              size="sm"
              variant="outline"
              colorPalette="purple"
            >
              <FiPlus /> Add Custom Item
            </Button>
          </Collapsible.Trigger>
        )}

        <Collapsible.Content>
          <VStack align="start" gap={4} mt={4} p={4} bg="pink.50" _dark={{ bg: 'pink.900/20' }} borderRadius="lg">
            <SegmentGroup.Root
              value={customType}
              onValueChange={(val) => {
                const strVal = typeof val === 'string' ? val : val?.value;
                if (strVal === 'interest' || strVal === 'skill') {
                  setCustomType(strVal);
                }
              }}
            >
              <SegmentGroup.Indicator colorPalette="pink" />
              <SegmentGroup.Items
                items={[
                  { value: 'interest', label: 'Interest' },
                  { value: 'skill', label: 'Skill' },
                ]}
                colorPalette="pink"
              />
            </SegmentGroup.Root>

            <FormControl w="100%">
              <FormLabel fontSize="sm" mb={2}>
                Add your own {customType}
              </FormLabel>
              <HStack>
                <InputGroup
                  endElement={
                    <HStack>
                      <Button
                        size="sm"
                        colorPalette="pink"
                        onClick={addCustomItem}
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
                    placeholder={`Enter your custom ${customType}...`}
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem();
                      }
                    }}
                  />
                </InputGroup>
              </HStack>
            </FormControl>
          </VStack>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Progress Summary */}
      <Box w="full" p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="lg">
        <VStack gap={3}>
          <HStack justify="space-between" w="full">
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
              Interests: {selectedInterests.length} / 2 minimum
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
                w={`${Math.min(100, (selectedInterests.length / 2) * 100)}%`}
                h="full"
                bg="pink.400"
                transition="width 0.3s"
              />
            </Box>
          </HStack>

          <HStack justify="space-between" w="full">
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
              Skills: {selectedSkills.length} / 1 minimum
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
                w={`${Math.min(100, selectedSkills.length * 100)}%`}
                h="full"
                bg="green.400"
                transition="width 0.3s"
              />
            </Box>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}