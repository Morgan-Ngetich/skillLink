import { InputGroup, Input, Box, IconButton } from "@chakra-ui/react";
import { CiSearch } from "react-icons/ci";
import { LiaTimesSolid } from "react-icons/lia";

interface SearchInputProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  search: string;
  setSearch: (value: string) => void;
  isFocused?: boolean;
  setIsFocused?: (value: boolean) => void;
  setDropdownVisible?: (value: boolean) => void;
  onSubmit: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  showSubmitButton?: boolean;
}

export const SearchInput = ({
  inputRef,
  search,
  setSearch,
  isFocused = false,
  setIsFocused,
  setDropdownVisible,
  onClear,
  placeholder = "Search...",
  showSubmitButton = true,
}: SearchInputProps) => {
  return (
    <>
      <InputGroup
        flex="1"
        borderWidth="1px"
        borderColor={isFocused ? "border.emphasized" : "border"}
        borderLeftRadius="full"
        borderEndRadius={showSubmitButton ? 0 : "full"}
        overflow="hidden"
        transition="all 0.2s"
        bg="bg"
      >
        <>
          <Input
            ref={inputRef}
            placeholder={placeholder}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setDropdownVisible?.(true);
            }}
            onFocus={() => {
              setIsFocused?.(true);
              setDropdownVisible?.(true);
            }}
            onBlur={() => setIsFocused?.(false)}
            border="none"
            _focus={{ boxShadow: "none", borderRightRadius: "none" }}
            _hover={{ borderRightRadius: "none" }}
            px={4}
            py={2}
            h="45px"
            fontSize="md"
            _placeholder={{ color: "fg.muted" }}
          />
          {search && (
            <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
              <IconButton
                onClick={onClear}
                variant="ghost"
                aria-label="Clear search"
                size="xs"
                fontSize="lg"
                color="fg.muted"
                _hover={{ color: "fg", bg: "bg.muted" }}
              >
                <LiaTimesSolid />
              </IconButton>
            </Box>
          )}
        </>
      </InputGroup>

      {showSubmitButton && (
        <IconButton
          type="submit"
          aria-label="Search"
          h="52px"
          px={4}
          borderRadius="full"
          borderStartRadius={0}
          bg="bg.muted"
          borderWidth="1px"
          borderColor={isFocused ? "border.emphasized" : "border"}
          borderLeft="none"
          color="fg"
          _hover={{ bg: "bg.subtle" }}
          fontSize="xl"
        >
          <CiSearch />
        </IconButton>
      )}
    </>
  );
};