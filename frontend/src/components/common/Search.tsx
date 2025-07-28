import { InputGroup, Input, Box, IconButton, Text, HStack } from "@chakra-ui/react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { LiaTimesSolid } from "react-icons/lia";
import { mentors, type Mentor } from "@/client/services/ment";
import { useDebounce } from "@/hooks/useDebounce"; // Adjust the import path as necessary
import { useFuseSearch } from "@/hooks/useFuseSearch ";
import { Avatar, useColorModeValue } from "../ui";
import type { FuseResult } from "fuse.js";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const initialQuery = urlParams.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<FuseResult<Mentor>[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // get Fuse search results
  const fuseResults = useFuseSearch(mentors, debouncedSearch);

  // Load history from localStorage once
  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      setHistory(Array.isArray(storedHistory) ? storedHistory : []);
    } catch {
      setHistory([]);
    }
  }, []);

  // Update search state when URL changes
  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  // Update suggestions based on debounced search term
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      return;
    }
    // const results = fuse.slice(0, 5).map(item => item.item);
    setSuggestions(fuseResults.slice(0, 5));
  }, [debouncedSearch, fuseResults]);

  // Handle search submit (enter or click suggestion)
  interface SubmitSearchFn {
    (query: string): void;
  }

  const submitSearch: SubmitSearchFn = (query) => {
    const trimmed = query.trim();
    // Only add to history if not empty
    if (trimmed) {
      const newHistory: string[] = [trimmed, ...history.filter((h: string) => h !== trimmed)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
    // Navigate even if empty
    navigate({ to: "/explore", search: { q: trimmed } });
    setDropdownVisible(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    setDropdownVisible(false);
  };

  // Close dropdown when clicking outside
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        event.target &&
        !(ref.current as HTMLElement).contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const highlightTextColor = useColorModeValue("teal.500", "teal.300");
  function highlightText(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <Text as="span" key={index} color={highlightTextColor} fontWeight="bold">
          {part}
        </Text>
      ) : (
        <Text as="span" key={index}>
          {part}
        </Text>
      )
    );
  }


  const suggestionBg = useColorModeValue("bg.subtle", "bg.muted")
  const suggestionBgHover = useColorModeValue("bg.muted", "bg.subtle")

  return (
    <Box
      position="relative"
      w="100%"
      maxW="600px"
      mx="auto"
      ref={ref}
    >
      <form onSubmit={onSubmit}>
        <InputGroup
          borderWidth={'1px'}
          borderColor={isFocused ? "teal.500" : "gray.300"}
          borderRadius="full"
          overflow="hidden"
          boxShadow={isFocused ? "md" : "none"}
          endElement={
            <Box display="flex" alignItems="center" gap="1">
              {search && (
                <IconButton
                  onClick={clearSearch}
                  variant="ghost"
                  aria-label="Clear search"
                  fontSize="sm"
                  size="sm"
                >
                  <LiaTimesSolid />
                </IconButton>
              )}
              <IconButton
                type="submit"
                aria-label="Search"
                variant="surface"
              >
                <CiSearch />
              </IconButton>
            </Box>
          }
        >
          <Input
            placeholder="Search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setDropdownVisible(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setDropdownVisible(true);
            }}
            onBlur={() => setIsFocused(false)}
            border="none"
            _focus={{ boxShadow: "none" }}
            px={4}
            fontSize="md"
            pe="6rem" // make space for the buttons
          />
        </InputGroup>

      </form>

      {dropdownVisible && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          borderRadius="md"
          shadow="xl"
          mt={1}
          border="1px solid"
          zIndex={10}
          maxH="400px"
          overflowY="auto"
        >
          {search.trim() ? (
            suggestions.length > 0 ? (
              suggestions.map((result, index) => {
                const { item: mentor, matches } = result;

                const matchedFields = matches?.map((m) => m.key) ?? [];

                return (
                  <Box
                    key={index}
                    px={4}
                    py={3}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    bg={suggestionBg}
                    _hover={{ bg: suggestionBgHover }}
                    onClick={() => submitSearch(mentor.name)}
                  >
                    <Avatar
                      boxSize="40px"
                      src={mentor.photo}
                      name={mentor.name}
                      mr={3}
                    />
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="md">
                        {highlightText(mentor.name, search)}
                      </Text>
                      <Text fontSize="sm" color="fg.muted">
                        {highlightText(mentor.title, search)}
                      </Text>
                      {/* <HStack mt={1} gap={2}>
                        {mentor.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="surface" fontSize="xs">
                            {skill}
                          </Badge>
                        ))}
                      </HStack> */}

                      {matchedFields.includes("skills") && (
                        <HStack gap={2} wrap="wrap">
                          {matches
                            ?.filter((m) => m.key === "skills")
                            .flatMap((match) => {
                              const value = match.value;
                              if (typeof value === "string") {
                                return value
                                  .split(",")
                                  .map((skill) => skill.trim())
                                  .filter((skill) =>
                                    skill.toLowerCase().includes(search.toLowerCase())
                                  );
                              }
                              return [];
                            })
                            .map((matchedSkill) => (
                              <Box
                                key={matchedSkill}
                                fontSize="2xs"
                                px={2}
                                py={1}
                                borderRadius="lg"
                                bg="purple.subtle"
                                color="white"
                                fontWeight="medium"
                                whiteSpace="nowrap"
                              >
                                {highlightText(matchedSkill, search)}
                              </Box>
                            ))}
                        </HStack>
                      )}



                    </Box>
                  </Box>

                );
              })
            ) : (
              <Box px={4} py={3} color="fg.muted" bg={suggestionBg}>
                No results found
              </Box>
            )
          ) : history.length > 0 ? (
            <>
              <Box
                px={4}
                py={2}
                borderBottom="1px solid"
                bg={suggestionBg}
                color="fg.muted"
              >
                Recent searches
              </Box>
              {history.map((h, i) => (
                <Box
                  key={i}
                  px={4}
                  py={3}
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  bg={suggestionBg}
                  _hover={{ bg: suggestionBgHover }}
                  onClick={() => submitSearch(h)}
                >
                  <CiSearch style={{ marginRight: "12px" }} size={'20px'} />
                  {h}
                </Box>
              ))}
              <Box
                px={4}
                // py={2}
                position={'absolute'}
                bottom={2}
                right={1}
                textAlign="right"
                cursor="pointer"
                fontWeight="medium"
                onClick={() => {
                  setHistory([]);
                  localStorage.setItem("searchHistory", "[]");
                }}
              >
                <HStack
                  _hover={{ bg: suggestionBgHover }} fontSize="sm"
                  p={2}
                  borderRadius="md"
                >
                  <LiaTimesSolid style={{ marginLeft: "4px" }} />
                  <Text fontSize="sm" color="fg.muted">Clear history</Text>
                </HStack>

              </Box>
            </>
          ) : (
            <Box px={4} py={3} bg={suggestionBg} color="fg.muted">
              Start typing to search
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Search;