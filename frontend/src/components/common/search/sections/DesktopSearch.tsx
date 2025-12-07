import { Box, HStack } from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import { SearchInput } from "./SearchInput";
import { SearchDropdown } from "./SearchDropdown";
import type { UnifiedSearchResult } from "../types";

interface DesktopSearchProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  search: string;
  setSearch: (value: string) => void;
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
  dropdownVisible: boolean;
  setDropdownVisible: (value: boolean) => void;
  unifiedResults: UnifiedSearchResult[];
  isLoading: boolean;
  history: string[];
  onSubmit: (query: string) => void;
  onClear: () => void;
  onClearHistory: () => void;
}

export const DesktopSearch = ({
  inputRef,
  search,
  setSearch,
  isFocused,
  setIsFocused,
  dropdownVisible,
  setDropdownVisible,
  unifiedResults,
  isLoading,
  history,
  onSubmit,
  onClear,
  onClearHistory,
}: DesktopSearchProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setDropdownVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(search);
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      w={{ base: "100%", md: "auto" }}
      flex={{ md: "1" }}
      maxW={{ md: "600px" }}
      mx="auto"
      display={{ base: "none", md: "block" }}
    >
      <form onSubmit={handleSubmit}>
        <HStack gap={0}>
          <SearchInput
            inputRef={inputRef}
            search={search}
            setSearch={setSearch}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            setDropdownVisible={setDropdownVisible}
            onSubmit={onSubmit}
            onClear={onClear}
            placeholder="Search mentors, sessions, or services..."
          />
        </HStack>
      </form>

      {dropdownVisible && (
        <SearchDropdown
          search={search}
          unifiedResults={unifiedResults}
          isLoading={isLoading}
          history={history}
          onSubmit={onSubmit}
          onClearHistory={onClearHistory}
        />
      )}
    </Box>
  );
};