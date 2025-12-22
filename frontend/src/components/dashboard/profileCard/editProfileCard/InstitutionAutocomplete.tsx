import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Input,
  Image,
  Text,
  HStack,
  VStack,
  Spinner,
  Separator
} from '@chakra-ui/react'
import { LuBuilding2, LuGraduationCap, LuSearch } from 'react-icons/lu'
import { useInstitutionOrCompanySearch, type OrgSuggestion } from '@/hooks/public/useInstitutionOrCompanySearch'

interface InstitutionAutocompleteProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onSelect: (suggestion: OrgSuggestion) => void
  type?: 'company' | 'instituition' | 'both'
}

export default function InstitutionAutocomplete({
  value,
  placeholder = "Start typing institution or company name...",
  onChange,
  onSelect,
  type = 'both'
}: InstitutionAutocompleteProps) {
  // Use TanStack Query version with options
  const { query, setQuery, suggestions, loading, clearSuggestions } =
    useInstitutionOrCompanySearch({
      includeCompanies: type === 'both' || type === 'company',
      includeUniversities: type === 'both' || type === 'instituition',
    })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync with external value
  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value, query, setQuery])

  // Filter suggestions by type if specified
  const filteredSuggestions = type === 'both'
    ? suggestions
    : suggestions.filter(s => s.type === type)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
    setShowSuggestions(true)
    setFocusedIndex(-1)
  }

  const handleSelect = (suggestion: OrgSuggestion) => {
    onSelect(suggestion)
    setQuery(suggestion.name)
    onChange(suggestion.name)
    setShowSuggestions(false)
    clearSuggestions()
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      handleSelect(filteredSuggestions[focusedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setFocusedIndex(-1)
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-suggestion-item]')
      items[focusedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [focusedIndex])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear failed logos when suggestions change
  useEffect(() => {
    setFailedLogos(new Set())
  }, [suggestions])

  return (
    <Box position="relative" w="full">
      <Box position="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (filteredSuggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          pr="40px"
          autoComplete="off"
        />

        {loading && (
          <Box position="absolute" right="12px" top="50%" transform="translateY(-50%)">
            <Spinner size="sm" color="blue.500" />
          </Box>
        )}

        {!loading && query && (
          <Box position="absolute" right="12px" top="50%" transform="translateY(-50%)" color="gray.400">
            <LuSearch size={18} />
          </Box>
        )}
      </Box>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box
          ref={dropdownRef}
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={1000}
          bg="cardbg"
          border="1px solid"
          borderColor="gray.subtle"
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
        >
          <VStack align="stretch" gap={0}>
            {filteredSuggestions.map((suggestion, index) => (
              <HStack
                key={suggestion.domain || `${suggestion.name}-${index}`}
                data-suggestion-item
                p={3}
                cursor="pointer"
                bg={focusedIndex === index ? 'blue.50' : 'transparent'}
                _hover={{ bg: 'gray.subtle' }}
                onClick={() => handleSelect(suggestion)}
                borderBottom="1px solid"
                borderBottomColor="gray.100"
                _last={{ borderBottom: 'none' }}
                transition="background 0.2s"
              >
                {/* Logo or Icon */}
                <Box
                  minW="33px"
                  h="33px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={{ base: 'gray.300', _dark: 'gray' }}
                  borderRadius="md"
                  flexShrink={0}
                  overflow="hidden"
                >
                  {suggestion.logo && !failedLogos.has(suggestion.logo) ? (
                    <Image
                      src={suggestion.logo}
                      alt={suggestion.name}
                      boxSize="33px"
                      objectFit="contain"
                      onError={() => {
                        setFailedLogos(prev => new Set(prev).add(suggestion.logo!))
                      }}
                    />
                  ) : (
                    suggestion.type === 'instituition' ? (
                      <LuGraduationCap size={20} />
                    ) : (
                      <LuBuilding2 size={20} />
                    )
                  )}
                </Box>

                {/* Name and Type */}
                <VStack align="start" gap={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {suggestion.name}
                  </Text>
                  {suggestion.domain && (
                    <Text fontSize="xs" color="fg.muted">
                      {suggestion.domain}
                    </Text>
                  )}
                </VStack>

                {/* Type Badge */}
                <Box
                  px={2}
                  py={0.5}
                  bg={suggestion.type === 'instituition' ? 'purple.100' : 'blue.100'}
                  color={suggestion.type === 'instituition' ? 'purple.700' : 'blue.700'}
                  fontSize="xs"
                  fontWeight="medium"
                  borderRadius="sm"
                  flexShrink={0}
                >
                  {suggestion.type === 'instituition' ? 'University' : 'Company'}
                </Box>
              </HStack>
            ))}
          </VStack>

          <Separator />
        </Box>
      )}

      {/* Empty State */}
      {showSuggestions && !loading && query.length >= 2 && filteredSuggestions.length === 0 && (
        <Box
          ref={dropdownRef}
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={1000}
          bg="cardbg"
          border="1px solid"
          borderColor="gray.subtle"
          borderRadius="md"
          boxShadow="lg"
          p={4}
        >
          <Text fontSize="sm" color="fg.subtle" textAlign="center">
            No results found for "{query}"
          </Text>
        </Box>
      )}
    </Box>
  )
}