import { Box, Text, VStack, Separator } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { SERVICE_CATEGORIES, PRICE_RANGES } from "../types";
import type { UseExploreFiltersReturn } from "@/hooks/explore/useExploreFilters";

interface ServiceFiltersProps {
  filters: UseExploreFiltersReturn;
}

export const ServiceFilters = ({ filters }: ServiceFiltersProps) => {
  return (
    <>
      <Box>
        <Text fontWeight="semibold" fontSize="lg" mb={4}>
          Category
        </Text>
        <VStack align="stretch" gap={3}>
          {SERVICE_CATEGORIES.map((category) => (
            <Checkbox
              key={category}
              checked={filters.selectedServiceCategories.includes(category)}
              onCheckedChange={() => filters.toggleServiceCategory(category)}
              size="lg"
            >
              <Text fontSize="md">{category}</Text>
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
              checked={filters.servicePriceRange.includes(range.value)}
              onCheckedChange={() => filters.toggleServicePrice(range.value)}
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