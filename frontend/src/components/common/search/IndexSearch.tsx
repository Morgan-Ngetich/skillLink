import { IconButton } from "@chakra-ui/react";
import { useState, useRef, type RefObject } from "react";
import { CiSearch } from "react-icons/ci";
import { DesktopSearch } from "./sections/DesktopSearch";
import { MobileSearchOverlay } from "./sections/MobileSearchOverlay";
import { useSearchState } from "@/hooks/search/useSearchState";
import { useSearchResults } from "@/hooks/search/useSearchResults";
import { useSearchHistory } from "@/hooks/search/useSearchHistory";

interface SearchProps {
  isMobile?: boolean;
}

const Search = ({ isMobile = false }: SearchProps) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { search, setSearch, isFocused, setIsFocused, dropdownVisible, setDropdownVisible, submitSearch, clearSearch } = useSearchState();
  const { unifiedResults, isLoading } = useSearchResults({ search });
  const { history, addToHistory, clearHistory } = useSearchHistory();

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true);
    setDropdownVisible(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
    setDropdownVisible(false);
    // no setSearch(urlQuery) here to prevent loop
  };

  const handleSubmit = (query: string) => {
    submitSearch(query);
    if (query.trim()) addToHistory(query.trim());
    setDropdownVisible(false);
    setIsMobileSearchOpen(false);
  };

  // Mobile vs Desktop rendering
  if (isMobile) {
    return (
      <>
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Search"
          variant="ghost"
          fontSize="2xl"
          onClick={handleMobileSearchOpen}
        >
          <CiSearch />
        </IconButton>

        {isMobileSearchOpen && (
          <MobileSearchOverlay
            inputRef={inputRef as RefObject<HTMLInputElement>}
            search={search}
            setSearch={setSearch}
            unifiedResults={unifiedResults}
            isLoading={isLoading}
            history={history}
            onSubmit={handleSubmit}
            onClear={clearSearch}
            onClose={handleMobileSearchClose}
            onClearHistory={clearHistory}
          />
        )}
      </>
    );
  }

  return (
    <DesktopSearch
      inputRef={inputRef as RefObject<HTMLInputElement>}
      search={search}
      setSearch={setSearch}
      isFocused={isFocused}
      setIsFocused={setIsFocused}
      dropdownVisible={dropdownVisible}
      setDropdownVisible={setDropdownVisible}
      unifiedResults={unifiedResults}
      isLoading={isLoading}
      history={history}
      onSubmit={handleSubmit}
      onClear={clearSearch}
      onClearHistory={clearHistory}
    />
  );
};

export default Search;
