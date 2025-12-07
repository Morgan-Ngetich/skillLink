import { Box, VStack, HStack, IconButton, InputGroup, Input, Text, Spinner } from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { CiSearch } from "react-icons/ci";
import { SearchResultItem } from "./SearchResultItem";
import { useSearchNavigation } from "@/hooks/search/useSearchNavigation";
import type { UnifiedSearchResult } from "../types";
import { useLocation } from "@tanstack/react-router";

interface MobileSearchOverlayProps {
  inputRef: React.RefObject<HTMLInputElement>;
  search: string;
  setSearch: (value: string) => void;
  unifiedResults: UnifiedSearchResult[];
  isLoading: boolean;
  history: string[];
  onSubmit: (query: string) => void;
  onClear: () => void;
  onClose: () => void;
  onClearHistory: () => void;
}

export const MobileSearchOverlay = ({
  inputRef,
  search,
  setSearch,
  unifiedResults,
  isLoading,
  history,
  onSubmit,
  onClear,
  onClose,
  onClearHistory,
}: MobileSearchOverlayProps) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const urlQuery = urlParams.get("q") || "";

  const { handleResultClick } = useSearchNavigation(urlQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(search);
  };

  const handleResultItemClick = (result: UnifiedSearchResult) => {
    handleResultClick(result);
    onClose();
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="bg"
      zIndex={1500}
      display={{ base: "block", md: "none" }}
    >
      <VStack gap={0} h="100%">
        {/* Mobile Search Header */}
        <HStack
          w="100%"
          px={2}
          py={2}
          borderBottom="1px solid"
          borderColor="border"
          gap={2}
        >
          <IconButton
            aria-label="Close search"
            variant="ghost"
            onClick={onClose}
            fontSize="xl"
          >
            <IoMdArrowBack />
          </IconButton>

          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            <InputGroup>
              <>
                <Input
                  ref={inputRef}
                  placeholder="Search mentors, sessions..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  border="none"
                  _focus={{ boxShadow: "none" }}
                  fontSize="md"
                  h="40px"
                />
                {search && (
                  <Box position="absolute" right={2} top="50%" transform="translateY(-50%)">
                    <IconButton
                      onClick={onClear}
                      variant="ghost"
                      aria-label="Clear search"
                      size="xs"
                      fontSize="lg"
                    >
                      <LiaTimesSolid />
                    </IconButton>
                  </Box>
                )}
              </>
            </InputGroup>
          </form>
        </HStack>

        {/* Mobile Results */}
        <Box w="100%" flex="1" overflowY="auto">
          {search.trim() ? (
            isLoading ? (
              <Box px={4} py={12} color="fg.muted" textAlign="center">
                <Spinner />
              </Box>
            ) : unifiedResults.length > 0 ? (
              <>
                <Text px={4} py={3} fontSize="xs" color="fg.muted" fontWeight="medium">
                  {unifiedResults.length} results
                </Text>
                {unifiedResults.map((result, index) => (
                  <Box key={`mobile-${result.type}-${index}`}>
                    <SearchResultItem result={result} onClick={handleResultItemClick} />
                  </Box>
                ))}
              </>
            ) : (
              <Box px={4} py={12} color="fg.muted" textAlign="center">
                <Text>No results found</Text>
              </Box>
            )
          ) : history.length > 0 ? (
            <>
              <HStack
                justify="space-between"
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor="border.subtle"
              >
                <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                  Recent searches
                </Text>
                <Text
                  fontSize="sm"
                  color="teal.500"
                  cursor="pointer"
                  onClick={onClearHistory}
                >
                  Clear all
                </Text>
              </HStack>
              {history.map((h, i) => (
                <HStack
                  key={i}
                  px={4}
                  py={4}
                  cursor="pointer"
                  gap={3}
                  borderBottom="1px solid"
                  borderColor="border.subtle"
                  onClick={() => onSubmit(h)}
                >
                  <CiSearch size={20} style={{ opacity: 0.6 }} />
                  <Text flex="1">{h}</Text>
                </HStack>
              ))}
            </>
          ) : (
            <Box px={4} py={12} color="fg.muted" textAlign="center">
              <Text>Start typing to search</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};