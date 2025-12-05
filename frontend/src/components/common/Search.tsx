import { InputGroup, Input, Box, IconButton, Text, HStack, VStack, Badge, Spinner } from "@chakra-ui/react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { LiaTimesSolid } from "react-icons/lia";
import { IoMdArrowBack } from "react-icons/io";
import { LuCalendar, LuBriefcase, LuUser } from "react-icons/lu";
import { useDebounce } from "@/hooks/search/useDebounce";
import { useFuseSearch } from "@/hooks/search/useFuseSearch";
import { usePublicMentors } from "@/hooks/public/usePublicMentors";
import { Avatar } from "../ui";
import type { UserPublic, MentorSessionPublic, MentorServicePublic } from "@/client";
import { format, parseISO, isValid } from "date-fns";
import { formatDuration } from "@/utils/calendarDataTransformer";

type SearchResultType = "mentor" | "session" | "service";

interface UnifiedSearchResult {
  type: SearchResultType;
  data: UserPublic | MentorSessionPublic | MentorServicePublic;
  score: number;
}

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Always read from URL as source of truth
  const urlParams = new URLSearchParams(location.search);
  const urlQuery = urlParams.get("q") || "";
  // const currentView = urlParams.get("view") || "mentors";

  const [search, setSearch] = useState(urlQuery);
  const [unifiedResults, setUnifiedResults] = useState<UnifiedSearchResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all data
  const {
    mentors = [],
    featuredSessions = [],
    featuredServices = [],
    isLoading,
  } = usePublicMentors({
    limit: 50,
  });

  // Search mentors
  const mentorResults = useFuseSearch(mentors, debouncedSearch, {
    keys: [
      "full_name",
      "profile.title",
      "profile.skills",
      "profile.about",
      "profile.area_of_focus",
    ],
    threshold: 0.3,
  });

  // Search sessions
  const sessionResults = useFuseSearch(featuredSessions, debouncedSearch, {
    keys: ["title", "description", "tags", "session_type"],
    threshold: 0.3,
  });

  // Search services
  const serviceResults = useFuseSearch(featuredServices, debouncedSearch, {
    keys: ["title", "description", "category", "highlights"],
    threshold: 0.3,
  });

  // Combine and sort all results
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setUnifiedResults([]);
      return;
    }

    const combined: UnifiedSearchResult[] = [
      ...mentorResults.map((r) => ({
        type: "mentor" as SearchResultType,
        data: r.item,
        score: r.score || 1,
      })),
      ...sessionResults.map((r) => ({
        type: "session" as SearchResultType,
        data: r.item,
        score: r.score || 1,
      })),
      ...serviceResults.map((r) => ({
        type: "service" as SearchResultType,
        data: r.item,
        score: r.score || 1,
      })),
    ];

    // Sort by score (lower is better in Fuse.js)
    combined.sort((a, b) => a.score - b.score);

    setUnifiedResults(combined.slice(0, 10)); // Top 10 results
  }, [debouncedSearch, mentorResults, sessionResults, serviceResults]);

  // Load history from localStorage once
  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      setHistory(Array.isArray(storedHistory) ? storedHistory : []);
    } catch {
      setHistory([]);
    }
  }, []);

  // Sync local state with URL changes
  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  // Handle search submit - maintains current view
  const submitSearch = (query: string) => {
    const trimmed = query.trim();
    const newParams = new URLSearchParams(location.search);
    
    if (trimmed) {
      // Save to history
      const newHistory: string[] = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      
      // Update URL with search query, preserve view
      newParams.set("q", trimmed);
      navigate({ to: "/explore", search: Object.fromEntries(newParams) });
    } else {
      // Clear search but keep other params
      newParams.delete("q");
      navigate({ to: "/explore", search: Object.fromEntries(newParams) });
    }
    
    setDropdownVisible(false);
    setIsMobileSearchOpen(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    const newParams = new URLSearchParams(location.search);
    newParams.delete("q");
    navigate({ to: "/explore", search: Object.fromEntries(newParams) });
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
    // Restore search to URL value
    setSearch(urlQuery);
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

  const handleResultClick = (result: UnifiedSearchResult) => {
    if (result.type === "mentor") {
      const mentor = result.data as UserPublic;
      navigate({ to: `/profile/${mentor.uuid}` });
    } else if (result.type === "session") {
      const session = result.data as MentorSessionPublic;
      navigate({
        to: `/explore`,
        search: {
          q: urlQuery || undefined,
          view: "sessions",
          sessionId: session.uuid,
        },
      });
    } else if (result.type === "service") {
      const service = result.data as MentorServicePublic;
      navigate({
        to: `/explore`,
        search: {
          q: urlQuery || undefined,
          view: "services",
          serviceId: service.uuid,
        },
      });
    }

    setDropdownVisible(false);
    setIsMobileSearchOpen(false);
  };

  const renderResult = (result: UnifiedSearchResult) => {
    const { type, data } = result;

    if (type === "mentor") {
      const mentor = data as UserPublic;
      return (
        <Box
          key={`mentor-${mentor.id}`}
          px={4}
          py={3}
          cursor="pointer"
          display="flex"
          alignItems="center"
          gap={3}
          _hover={{ bg: "bg.muted" }}
          transition="background 0.15s"
          onClick={() => handleResultClick(result)}
        >
          <Avatar boxSize="12" src={mentor.avatar_url} name={mentor.full_name} />
          <VStack align="start" gap={1} flex="1">
            <HStack gap={2}>
              <Text fontWeight="medium" fontSize="md">
                {mentor.full_name}
              </Text>
              <Text>•</Text>
              <HStack gap={2}>
                <LuUser size={14} style={{ opacity: 0.6 }} />
                <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                  MENTOR
                </Text>
              </HStack>
            </HStack>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {mentor.profile?.title}
            </Text>
            {mentor.profile?.skills && mentor.profile.skills.length > 0 && (
              <HStack gap={1.5} wrap="wrap" mt={1}>
                {mentor.profile.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} size="sm" colorPalette="purple" variant="subtle">
                    {skill}
                  </Badge>
                ))}
              </HStack>
            )}
          </VStack>
        </Box>
      );
    }

    if (type === "session") {
      const session = data as MentorSessionPublic;
      const startDate = session.start_time ? parseISO(session.start_time) : null;

      return (
        <Box
          key={`session-${session.id}`}
          px={4}
          py={3}
          cursor="pointer"
          display="flex"
          alignItems="start"
          gap={3}
          _hover={{ bg: "bg.muted" }}
          transition="background 0.15s"
          onClick={() => handleResultClick(result)}
        >
          <Box
            boxSize="12"
            borderRadius="md"
            bg="blue.subtle"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            bgImage={session?.cover_image ? `url(${session.cover_image})` : undefined}
            bgSize="cover"
          >
            <LuCalendar size={20} color="white" />
          </Box>
          <VStack align="start" gap={1} flex="1">
            <HStack>
              <Text fontWeight="medium" fontSize="md" lineClamp={1}>
                {session.title}
              </Text>
              <Text>•</Text>
              <HStack gap={2}>
                <LuCalendar size={14} style={{ opacity: 0.6 }} />
                <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                  SESSION
                </Text>
              </HStack>
            </HStack>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {session.description}
            </Text>
            <HStack gap={2} fontSize="xs" color="fg.muted">
              {startDate && isValid(startDate) && (
                <Text>{format(startDate, "MMM d, yyyy")}</Text>
              )}
              <Text>•</Text>
              <Text>{formatDuration(session.duration_minutes)} min</Text>
              <Text>•</Text>
              <Text fontWeight="semibold">
                {session.price_usd ? `$${session.price_usd}` : "Free"}
              </Text>
            </HStack>
          </VStack>
        </Box>
      );
    }

    if (type === "service") {
      const service = data as MentorServicePublic;
      return (
        <Box
          key={`service-${service.id}`}
          px={4}
          py={3}
          cursor="pointer"
          display="flex"
          alignItems="start"
          gap={3}
          _hover={{ bg: "bg.muted" }}
          transition="background 0.15s"
          onClick={() => handleResultClick(result)}
        >
          <Box
            boxSize="12"
            borderRadius="md"
            bg="green.subtle"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            bgImage={service.banner_url ? `url(${service.banner_url})` : undefined}
            bgSize="cover"
          >
            <LuBriefcase size={20} color="white" />
          </Box>
          <VStack align="start" gap={1} flex="1">
            <HStack>
              <Text fontWeight="medium" fontSize="md" lineClamp={1}>
                {service.title}
              </Text>
              <Text>•</Text>
              <HStack gap={2}>
                <LuBriefcase size={14} style={{ opacity: 0.6 }} />
                <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                  SERVICE
                </Text>
              </HStack>
            </HStack>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {service.description}
            </Text>
            <HStack gap={2} fontSize="xs" color="fg.muted">
              {service.category && (
                <>
                  <Badge size="sm" colorPalette="green" variant="subtle">
                    {service.category}
                  </Badge>
                  <Text>•</Text>
                </>
              )}
              <Text fontWeight="semibold">
                {service.price_usd ? `$${service.price_usd}` : "Free"}
              </Text>
            </HStack>
          </VStack>
        </Box>
      );
    }

    return null;
  };

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
                  placeholder="Search mentors, sessions, or services..."
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
              isLoading ? (
                <Box px={4} py={8} color="fg.muted" textAlign="center">
                  <Spinner />
                </Box>
              ) : unifiedResults.length > 0 ? (
                <>
                  <Text px={4} py={2} fontSize="xs" color="fg.muted" fontWeight="medium">
                    {unifiedResults.length} results found
                  </Text>
                  {unifiedResults.map((result) => renderResult(result))}
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
                <Text fontSize="sm" mt={2}>
                  Search for mentors, sessions, or services
                </Text>
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
            <HStack w="100%" px={2} py={2} borderBottom="1px solid" borderColor="border" gap={2}>
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
                isLoading ? (
                  <Box px={4} py={12} color="fg.muted" textAlign="center">
                    <Spinner />
                  </Box>
                ) : unifiedResults.length > 0 ? (
                  <>
                    <Text px={4} py={3} fontSize="xs" color="fg.muted" fontWeight="medium">
                      {unifiedResults.length} results
                    </Text>
                    {unifiedResults.map((result) => (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <Box key={`mobile-${result.type}-${(result.data as any).id}`}>
                        {renderResult(result)}
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