import { Box, Text, HStack, Spinner } from "@chakra-ui/react";
import { CiSearch } from "react-icons/ci";
import { SearchResultItem } from "./SearchResultItem";
import { useSearchNavigation } from "@/hooks/search/useSearchNavigation";
import type { UnifiedSearchResult } from "../types";
import { useLocation } from "@tanstack/react-router";

interface SearchDropdownProps {
  search: string;
  unifiedResults: UnifiedSearchResult[];
  isLoading: boolean;
  history: string[];
  onSubmit: (query: string) => void;
  onClearHistory: () => void;
}

export const SearchDropdown = ({
  search,
  unifiedResults,
  isLoading,
  history,
  onSubmit,
  onClearHistory,
}: SearchDropdownProps) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const urlQuery = urlParams.get("q") || "";
  
  const { handleResultClick } = useSearchNavigation(urlQuery);

  return (
    <Box
      position="absolute"
      top="calc(100% + 8px)"
      left="0"
      right="0"
      bg="bg"
      borderRadius="xl"
      shadow="lg"
      border="1px solid"
      borderColor="border"
      zIndex={1000}
      maxH="70vh"
      overflowY="auto"
      py={2}
    >
      {search.trim() ? (
        isLoading ? (
          <Box px={4} py={8} color="fg.muted" textAlign="center">
            <Spinner />
          </Box>
        ) : unifiedResults.length > 0 ? (
          <>
            <Text px={4} py={2} fontSize="xs" color="fg.muted" fontWeight="medium">
              {unifiedResults.length} results found
            </Text>
            {unifiedResults.map((result, index) => (
              <SearchResultItem
                key={`${result.type}-${index}`}
                result={result}
                onClick={handleResultClick}
              />
            ))}
          </>
        ) : (
          <Box px={4} py={8} color="fg.muted" textAlign="center">
            <Text>No results found</Text>
            <Text fontSize="sm" mt={2}>
              Try searching for mentors, sessions, or services
            </Text>
          </Box>
        )
      ) : history.length > 0 ? (
        <>
          <HStack justify="space-between" px={4} py={2} mb={1}>
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              Recent searches
            </Text>
            <Text
              fontSize="sm"
              color="teal.500"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
              onClick={onClearHistory}
            >
              Clear all
            </Text>
          </HStack>
          {history.map((h, i) => (
            <HStack
              key={i}
              px={4}
              py={3}
              cursor="pointer"
              gap={3}
              _hover={{ bg: "bg.muted" }}
              transition="background 0.15s"
              onClick={() => onSubmit(h)}
            >
              <CiSearch size={20} style={{ opacity: 0.6 }} />
              <Text flex="1">{h}</Text>
            </HStack>
          ))}
        </>
      ) : (
        <Box px={4} py={8} color="fg.muted" textAlign="center">
          <Text>Start typing to search</Text>
          <Text fontSize="sm" mt={2}>
            Search for mentors, sessions, or services
          </Text>
        </Box>
      )}
    </Box>
  );
};