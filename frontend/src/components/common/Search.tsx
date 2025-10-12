import { InputGroup, Input, Box, IconButton, Text, HStack, VStack } from "@chakra-ui/react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { LiaTimesSolid } from "react-icons/lia";
import { IoMdArrowBack } from "react-icons/io";
import { mentors, type Mentor } from "@/client/services/ment";
import { useDebounce } from "@/hooks/useDebounce";
import { useFuseSearch } from "@/hooks/useFuseSearch ";
import { Avatar } from "../ui";
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const fuseResults = useFuseSearch(mentors, debouncedSearch);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setSuggestions(fuseResults.slice(0, 5));
  }, [debouncedSearch, fuseResults]);

  // Handle search submit
  const submitSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      const newHistory: string[] = [trimmed, ...history.filter((h: string) => h !== trimmed)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
    navigate({ to: "/explore", search: { q: trimmed } });
    setDropdownVisible(false);
    setIsMobileSearchOpen(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true);
    setDropdownVisible(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
    setDropdownVisible(false);
    setSearch("");
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

  function highlightText(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <Text as="span" key={index} color="teal.500" fontWeight="semibold">
          {part}
        </Text>
      ) : (
        <Text as="span" key={index}>
          {part}
        </Text>
      )
    );
  }

  return (
    <>
      {/* Desktop Search */}
      <Box
        position="relative"
        w={{ base: "100%", md: "auto" }}
        flex={{ md: "1" }}
        maxW={{ md: "600px" }}
        mx="auto"
        display={{ base: "none", md: "block" }}
        ref={ref}
      >
        <form onSubmit={onSubmit}>
          <HStack gap={0}>
            <InputGroup
              flex="1"
              borderWidth="1px"
              borderColor={isFocused ? "border.emphasized" : "border"}
              borderLeftRadius="full"
              borderEndRadius={0}
              overflow="hidden"
              transition="all 0.2s"
              bg="bg"
            >
              <>
                <Input
                  ref={inputRef}
                  placeholder="Search"
                  type="text"
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
                  _focus={{ boxShadow: "none", borderRightRadius: "none" }}
                  _hover={{borderRightRadius: "none" }}
                  px={4}
                  py={2}
                  h="45px"
                  fontSize="md"
                  _placeholder={{ color: "fg.muted" }}
                />
                {search && (
                  <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                    <IconButton
                      onClick={clearSearch}
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
            <IconButton
              type="submit"
              aria-label="Search"
              h="45px"
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
          </HStack>
        </form>

        {/* Dropdown */}
        {dropdownVisible && (
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
                      gap={3}
                      _hover={{ bg: "bg.muted" }}
                      transition="background 0.15s"
                      onClick={() => submitSearch(mentor.name)}
                    >
                      <Avatar
                        boxSize="48px"
                        src={mentor.photo}
                        name={mentor.name}
                      />
                      <VStack align="start" gap={1} flex="1">
                        <Text fontWeight="medium" fontSize="md" lineHeight="short">
                          {highlightText(mentor.name, search)}
                        </Text>
                        <Text fontSize="sm" color="fg.muted" lineHeight="short">
                          {highlightText(mentor.title, search)}
                        </Text>
                        {matchedFields.includes("skills") && (
                          <HStack gap={1.5} wrap="wrap" mt={1}>
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
                                    )
                                    .slice(0, 3);
                                }
                                return [];
                              })
                              .map((matchedSkill) => (
                                <Box
                                  key={matchedSkill}
                                  fontSize="xs"
                                  px={2}
                                  py={0.5}
                                  borderRadius="md"
                                  bg="purple.subtle"
                                  color="purple.fg"
                                  fontWeight="medium"
                                >
                                  {highlightText(matchedSkill, search)}
                                </Box>
                              ))}
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  );
                })
              ) : (
                <Box px={4} py={8} color="fg.muted" textAlign="center">
                  <Text>No results found</Text>
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
                    onClick={() => {
                      setHistory([]);
                      localStorage.setItem("searchHistory", "[]");
                    }}
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
                    onClick={() => submitSearch(h)}
                  >
                    <CiSearch size={20} style={{ opacity: 0.6 }} />
                    <Text flex="1">{h}</Text>
                  </HStack>
                ))}
              </>
            ) : (
              <Box px={4} py={8} color="fg.muted" textAlign="center">
                <Text>Start typing to search</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Mobile Search Button */}
      <IconButton
        display={{ base: "flex", md: "none" }}
        aria-label="Search"
        variant="ghost"
        fontSize="2xl"
        onClick={handleMobileSearchOpen}
      >
        <CiSearch />
      </IconButton>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
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
                onClick={handleMobileSearchClose}
                fontSize="xl"
              >
                <IoMdArrowBack />
              </IconButton>
              <form onSubmit={onSubmit} style={{ flex: 1 }}>
                <InputGroup>
                  <>
                    <Input
                      ref={inputRef}
                      placeholder="Search"
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
                          onClick={clearSearch}
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
                        gap={3}
                        borderBottom="1px solid"
                        borderColor="border.subtle"
                        onClick={() => submitSearch(mentor.name)}
                      >
                        <Avatar
                          boxSize="56px"
                          src={mentor.photo}
                          name={mentor.name}
                        />
                        <VStack align="start" gap={1} flex="1">
                          <Text fontWeight="medium" fontSize="md">
                            {highlightText(mentor.name, search)}
                          </Text>
                          <Text fontSize="sm" color="fg.muted">
                            {highlightText(mentor.title, search)}
                          </Text>
                          {matchedFields.includes("skills") && (
                            <HStack gap={1.5} wrap="wrap" mt={1}>
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
                                      )
                                      .slice(0, 3);
                                  }
                                  return [];
                                })
                                .map((matchedSkill) => (
                                  <Box
                                    key={matchedSkill}
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                    bg="purple.subtle"
                                    color="purple.fg"
                                    fontWeight="medium"
                                  >
                                    {highlightText(matchedSkill, search)}
                                  </Box>
                                ))}
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    );
                  })
                ) : (
                  <Box px={4} py={12} color="fg.muted" textAlign="center">
                    <Text>No results found</Text>
                  </Box>
                )
              ) : history.length > 0 ? (
                <>
                  <HStack justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="border.subtle">
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                      Recent searches
                    </Text>
                    <Text
                      fontSize="sm"
                      color="teal.500"
                      cursor="pointer"
                      onClick={() => {
                        setHistory([]);
                        localStorage.setItem("searchHistory", "[]");
                      }}
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
                      onClick={() => submitSearch(h)}
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
      )}
    </>
  );
};

export default Search;