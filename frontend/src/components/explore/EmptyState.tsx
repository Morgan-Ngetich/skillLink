import { VStack, Text, HStack, Button } from "@chakra-ui/react";

interface EmptyStateProps {
  title: string;
  hasActiveFilters: boolean;
  searchQuery: string;
  onClearFilters: () => void;
  onClearSearch: () => void;
}

export const EmptyState = ({
  title,
  hasActiveFilters,
  searchQuery,
  onClearFilters,
  onClearSearch,
}: EmptyStateProps) => {
  return (
    <VStack py={20} gap={4}>
      <Text fontSize="xl" fontWeight="semibold">
        {title}
      </Text>
      <Text color="fg.muted" textAlign="center" maxW="md">
        Try adjusting your filters or search
      </Text>
      {(hasActiveFilters || searchQuery) && (
        <HStack gap={2}>
          {hasActiveFilters && (
            <Button onClick={onClearFilters} colorPalette="purple" variant="outline">
              Clear filters
            </Button>
          )}
          {searchQuery && (
            <Button onClick={onClearSearch}>Clear search</Button>
          )}
        </HStack>
      )}
    </VStack>
  );
};