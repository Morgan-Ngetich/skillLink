import {
  Box,
  Input,
  InputGroup,
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
  IconButton,
  Flex,
  // useDisclosure,
} from "@chakra-ui/react"
import {
  FaSearch,
  FaTimes,
  // FaFilter,
  // FaChevronDown,
  // FaChevronUp
} from "react-icons/fa"
import { useColorModeValue } from "@/components/ui"
import { useRef, useState, useEffect } from "react"
import { useDocsSearch, type SearchResult } from "../hooks/useDocsSearch"

interface DocsSearchProps {
  onNavigate?: (url: string) => void
  placeholder?: string
  maxWidth?: string
  showFilters?: boolean
}

// Custom hook for outside click detection
function useOutsideClick({
  ref,
  handler
}: {
  ref: React.RefObject<HTMLElement | null>
  handler: () => void
}) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, handler])
}

export const DocsSearch = ({
  onNavigate,
  placeholder = "Search documentation...",
  maxWidth = "600px",
  // showFilters = true
}: DocsSearchProps) => {
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // const { open: filtersOpen, onToggle: toggleFilters } = useDisclosure()
  const [isOpen, setIsOpen] = useState(false)

  const {
    query,
    searchResults,
    isSearching,
    isLoading,
    error,
    // filters,
    // availableSections,
    // availableTags,
    updateQuery,
    // updateFilters,
    // clearFilters,
    clearSearch,
    hasResults,
    suggestions,
  } = useDocsSearch({ maxResults: 10, includeContent: true })

  // Colors for theming
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const resultsBg = useColorModeValue("white", "gray.800")
  const shadowColor = useColorModeValue("0 4px 12px rgba(0,0,0,0.1)", "0 4px 12px rgba(0,0,0,0.3)")

  useOutsideClick({
    ref: searchRef,
    handler: () => setIsOpen(false)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateQuery(value)
    setIsOpen(value.length > 0)
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      onNavigate?.(result.url)
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    updateQuery(suggestion)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    clearSearch()
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // const handleFilterChange = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
  //   const currentValues = filters[filterType] || []
  //   const newValues = checked
  //     ? [...currentValues, value]
  //     : currentValues.filter(v => v !== value)

  //   updateFilters({ [filterType]: newValues })
  // }

  // const hasActiveFilters = Object.values(filters).some(filter => filter && filter.length > 0)

  return (
    <Box ref={searchRef} maxW={maxWidth} w="full" position="relative">
      <VStack gap={3} align="stretch">
        {/* Search Input */}
        <InputGroup
          startElement={<FaSearch color="gray.500" />}
          endElement={
            <HStack gap={1}>
              {/* {showFilters && (
                <IconButton
                  aria-label="Toggle filters"
                  size="sm"
                  variant="ghost"
                  onClick={toggleFilters}
                  color={hasActiveFilters ? "blue.500" : "gray.500"}
                >
                  {filtersOpen ? <FaChevronUp /> : <FaChevronDown />}
                </IconButton>
              )} */}
              {isSearching && <Spinner size="sm" color="teal.500" />}
              {query && (
                <IconButton
                  aria-label="Clear search"
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                >
                  <FaTimes />
                </IconButton>
              )}
            </HStack>
          }
        >
          <Input
            maxH="40px"
            ref={inputRef}
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length > 0 && setIsOpen(true)}
            bg={bgColor}
            border="2px solid"
            borderColor={borderColor}
            _hover={{ borderColor: "orange.300" }}
            _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" }}
            borderRadius="lg"
          />

        </InputGroup>

        {/* Filters */}
        {/* {showFilters && filtersOpen && (
          <Box
            p={4}
            bg={hoverBg}
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            zIndex={1000}
          >
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <FaFilter size={4} />
                  <Text fontSize="sm" fontWeight="medium">Filters</Text>
                </HStack>
                {hasActiveFilters && (
                  <Text
                    fontSize="sm"
                    color="blue.500"
                    cursor="pointer"
                    onClick={clearFilters}
                    _hover={{ textDecoration: "underline" }}
                  >
                    Clear all
                  </Text>
                )}
              </HStack>

              <HStack wrap="wrap" gap={4}>
                {availableSections.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" mb={2} color="gray.600">
                      Sections
                    </Text>
                    <HStack wrap="wrap" gap={1}>
                      {availableSections.slice(0, 5).map(section => (
                        <Badge 
                          key={section}
                          variant={filters.sections?.includes(section) ? "solid" : "outline"}
                          colorPalette="blue"
                          cursor="pointer"
                          onClick={() =>
                            handleFilterChange("sections", section, !filters.sections?.includes(section))
                          }
                        >
                          {section}
                        </Badge >
                      ))}
                    </HStack>
                  </Box>
                )}

                {availableTags.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" mb={2} color="gray.600">
                      Tags
                    </Text>
                    <HStack wrap="wrap" gap={1}>
                      {availableTags.slice(0, 8).map(tag => (
                        <Badge 
                          key={tag}
                          variant={filters.tags?.includes(tag) ? "solid" : "outline"}
                          colorPalette="green"
                          cursor="pointer"
                          onClick={() =>
                            handleFilterChange("tags", tag, !filters.tags?.includes(tag))
                          }
                        >
                          {tag}
                        </Badge >
                      ))}
                    </HStack>
                  </Box>
                )}
              </HStack>
            </VStack>
          </Box>
        )} */}
      </VStack>

      {/* Search Results Dropdown */}
      {isOpen && (
          <Box
            position="fixed"
            top={`${searchRef.current?.getBoundingClientRect().bottom || 0}px`}
            left={`${searchRef.current?.getBoundingClientRect().left || 0}px`}
            // right={`${272}px`}
            width={`${searchRef.current?.getBoundingClientRect().width || 600}px`}
            maxW={"800px"}
            mt={2}
            bg={resultsBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            boxShadow={shadowColor}
            maxH="400px"
            overflowY="auto"
            zIndex={1000}
          >
            {/* Loading State */}
            {isLoading && (
              <Flex justify="center" p={4}>
                <Spinner size="sm" />
                <Text ml={2} fontSize="sm" color="gray.500">Loading...</Text>
              </Flex>
            )}

            {/* Error State */}
            {error && (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="red.500">
                  Search error occurred. Please try again.
                </Text>
              </Box>
            )}

            {/* No Results */}
            {!isLoading && !error && query && !hasResults && (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No results found for "{query}"
                </Text>
              </Box>
            )}

            {/* Suggestions */}
            {!isLoading && !error && suggestions.length > 0 && !hasResults && (
              <Box p={3} borderBottom="1px solid" borderColor={borderColor}>
                <Text fontSize="xs" color="gray.500" mb={2}>Suggestions:</Text>
                <VStack gap={1} align="stretch">
                  {suggestions.map(suggestion => (
                    <Text
                      key={suggestion}
                      fontSize="sm"
                      p={2}
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: hoverBg }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Search Results */}
            {!isLoading && !error && hasResults && (
              <VStack gap={0} align="stretch" maxH="350px" overflowY="auto">
                {searchResults.map((result, index) => {
                  // Handle section headers
                  if ('isSectionHeader' in result && result.isSectionHeader) {
                    return (
                      <Box
                        key={result.id}
                        // p={3}
                        bg={hoverBg}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                      >
                        <Text fontSize="sm" fontWeight="semibold">
                          {result.title}
                        </Text>
                      </Box>
                    )
                  }

                  return (
                    // <Link
                    //   to={result?.url}
                    // >
                      <Box
                        key={result.id}
                        px={4}
                        py={2}
                        cursor="pointer"
                        borderBottom={index < searchResults.length - 1 ? "1px solid" : "none"}
                        borderColor={borderColor}
                        _hover={{ bg: hoverBg }}
                        onClick={() => handleResultClick(result)}
                      >
                        <VStack gap={2} align="stretch">
                          <HStack justify="space-between" align="flex-start">
                            <Box flex={1}>
                              <Text
                                fontSize="md"
                                fontWeight="medium"
                                lineHeight="short"
                                dangerouslySetInnerHTML={{
                                  __html: result.highlightedTitle || result.title
                                }}
                              />
                              {result.section && (
                                <Text fontSize="xs" color="fg.muted" >
                                  {result.section}
                                </Text>
                              )}
                            </Box>
                            {/* {result.score && (
                            <Badge  size="sm" colorPalette="gray">
                              {Math.round((1 - result.score) * 100)}%
                            </Badge >
                          )} */}
                          </HStack>

                          {result.highlightedExcerpt && (
                            <Text
                              fontSize="sm"
                              color="fg.muted"
                              lineHeight="short"
                              dangerouslySetInnerHTML={{
                                __html: result.highlightedExcerpt
                              }}
                            />
                          )}

                          {result.tags.length > 0 && (
                            <HStack wrap="wrap" gap={1}>
                              {result.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} size="sm" colorPalette="orange" variant={"surface"}>
                                  {tag}
                                </Badge >
                              ))}
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    // </Link>
                  )
                })}
              </VStack>
            )}
          </Box>
      )}
    </Box>
  )
}