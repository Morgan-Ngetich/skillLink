import { Box, Text, VStack, Separator } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { EXPERTISE_OPTIONS, EXPERIENCE_LEVELS, PRICE_RANGES } from "../types";
import type { UseExploreFiltersReturn } from "@/hooks/explore/useExploreFilters";

interface MentorFiltersProps {
  filters: UseExploreFiltersReturn;
}

export const MentorFilters = ({ filters }: MentorFiltersProps) => {
  return (
    <>
      <Box>
        <Text fontWeight="semibold" fontSize="lg" mb={4}>
          Area of Expertise
        </Text>
        <VStack align="stretch" gap={3}>
          {EXPERTISE_OPTIONS.map((expertise) => (
            <Checkbox
              key={expertise}
              checked={filters.selectedExpertise.includes(expertise)}
              onCheckedChange={() => filters.toggleExpertise(expertise)}
              size="lg"
            >
              <Text fontSize="md">{expertise}</Text>
            </Checkbox>
          ))}
        </VStack>
      </Box>

      <Separator />

      <Box>
        <Text fontWeight="semibold" fontSize="lg" mb={4}>
          Experience Level
        </Text>
        <VStack align="stretch" gap={3}>
          {EXPERIENCE_LEVELS.map((level) => (
            <Checkbox
              key={level.value}
              checked={filters.selectedExperience.includes(level.value)}
              onCheckedChange={() => filters.toggleExperience(level.value)}
              size="lg"
            >
              <Text fontSize="md">{level.label}</Text>
            </Checkbox>
          ))}
        </VStack>
      </Box>

      <Separator />

      <Box>
        <Text fontWeight="semibold" fontSize="lg" mb={4}>
          Price Range
        </Text>
        <VStack align="stretch" gap={3}>
          {PRICE_RANGES.map((range) => (
            <Checkbox
              key={range.value}
              checked={filters.mentorPriceRange.includes(range.value)}
              onCheckedChange={() => filters.toggleMentorPrice(range.value)}
              size="lg"
            >
              <Text fontSize="md">{range.label}</Text>
            </Checkbox>
          ))}
        </VStack>
      </Box>

      <Separator />

      <Box>
        <Text fontWeight="semibold" fontSize="lg" mb={4}>
          Availability
        </Text>
        <Checkbox
          checked={filters.availableOnly}
          onCheckedChange={(e) => filters.setAvailableOnly(!!e.checked)}
          size="lg"
        >
          <VStack align="start" gap={1}>
            <Text fontSize="md" fontWeight="medium">
              Available this week
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Show mentors with upcoming availability
            </Text>
          </VStack>
        </Checkbox>
      </Box>
    </>
  );
};