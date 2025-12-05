import { Box, Text, VStack, Separator } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { SESSION_TYPES, PRICE_RANGES } from "../types";
import type { UseExploreFiltersReturn } from "@/hooks/explore/useExploreFilters";

interface SessionFiltersProps {
  filters: UseExploreFiltersReturn;
}

export const SessionFilters = ({ filters }: SessionFiltersProps) => {
  return (
    <>
      <Box>
        <Text fontWeight="semibold" fontSize="lg" mb={4}>
          Session Type
        </Text>
        <VStack align="stretch" gap={3}>
          {SESSION_TYPES.map((type) => (
            <Checkbox
              key={type}
              checked={filters.selectedSessionTypes.includes(type)}
              onCheckedChange={() => filters.toggleSessionType(type)}
              size="lg"
            >
              <Text fontSize="md">{type}</Text>
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
              checked={filters.sessionPriceRange.includes(range.value)}
              onCheckedChange={() => filters.toggleSessionPrice(range.value)}
              size="lg"
            >
              <Text fontSize="md">{range.label}</Text>
            </Checkbox>
          ))}
        </VStack>
      </Box>
    </>
  );
};