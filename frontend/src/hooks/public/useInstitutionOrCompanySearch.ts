import { useState, useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/search/useDebounce"

export interface OrgSuggestion {
  name: string
  logo?: string | null
  domain?: string
  type?: 'company' | 'instituition'
}

// Fetch function for companies
const LOGO_DEV_PUBLIC_KEY = 'pk_FsvjqVRCSg-41t83zMWRIw';

async function fetchCompanies(query: string): Promise<OrgSuggestion[]> {
  const response = await fetch(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`,
    { signal: AbortSignal.timeout(3000) }
  )

  if (!response.ok) throw new Error('Failed to fetch companies')

  const data = await response.json()
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((c: any) => ({
    name: c.name,
    logo: c.domain ? `https://img.logo.dev/${c.domain}?token=${LOGO_DEV_PUBLIC_KEY}` : null,
    domain: c.domain,
    type: 'company' as const
  }))
}

// Fetch function for universities
async function fetchUniversities(query: string): Promise<OrgSuggestion[]> {
  const response = await fetch(
    `https://university-domains-list-api-g36q.onrender.com/search?name=${encodeURIComponent(query)}`,
    { signal: AbortSignal.timeout(3000) }
  )

  if (!response.ok) throw new Error('Failed to fetch universities')

  const data = await response.json()
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.slice(0, 5).map((u: any) => {
    const domain = u.domains?.[0]
    return {
      name: u.name,
      logo: domain ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_PUBLIC_KEY}` : null,
      domain: domain,
      type: 'instituition' as const
    }
  })
}

interface UseInstitutionOrCompanySearchOptions {
  includeCompanies?: boolean
  includeUniversities?: boolean
  debounceMs?: number // Allow customization
  minQueryLength?: number // Minimum characters before search
}

/**
 * Advanced search hook with request throttling and cost management
 * 
 * Features:
 * - Debouncing (default 1000ms) - prevents requests while typing
 * - Minimum query length (default 2 chars) - reduces unnecessary requests
 * - React Query caching (5min stale, 10min GC) - reuses previous results
 * - No refetch on window focus - saves API calls
 * - Request deduplication - multiple components use same cache
 */
export function useInstitutionOrCompanySearch(
  options: UseInstitutionOrCompanySearchOptions = {}
) {
  const {
    includeCompanies = true,
    includeUniversities = true,
    debounceMs = 1000, // Customizable debounce time
    minQueryLength = 2 // Don't search until at least 2 characters
  } = options

  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, debounceMs)

  // Only fetch if query meets minimum length requirement
  const shouldFetch = debouncedQuery.length >= minQueryLength

  // Use useQueries for parallel fetching with separate caching
  const queries = useQueries({
    queries: [
      {
        queryKey: ['companies', debouncedQuery],
        queryFn: () => fetchCompanies(debouncedQuery),
        enabled: shouldFetch && includeCompanies,
        staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
        gcTime: 1000 * 60 * 10, // 10 minutes - cache kept in memory
        retry: 1, // Only retry once on failure
        refetchOnWindowFocus: false, // Don't refetch when tab regains focus
        refetchOnMount: false, // Don't refetch when component mounts if data exists
      },
      {
        queryKey: ['universities', debouncedQuery],
        queryFn: () => fetchUniversities(debouncedQuery),
        enabled: shouldFetch && includeUniversities,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      }
    ]
  })

  const [companiesQuery, universitiesQuery] = queries

  // Combine and deduplicate results
  const suggestions = useMemo(() => {
    const results: OrgSuggestion[] = []

    if (companiesQuery.data) {
      results.push(...companiesQuery.data)
    }

    if (universitiesQuery.data) {
      results.push(...universitiesQuery.data)
    }

    // Remove duplicates by name and limit to 8 results
    return results
      .filter((item, index, self) =>
        index === self.findIndex(t => t.name === item.name)
      )
      .slice(0, 8)
  }, [companiesQuery.data, universitiesQuery.data])

  const isLoading = queries.some(q => q.isLoading)
  const isFetching = queries.some(q => q.isFetching)
  const hasError = queries.some(q => q.error)

  const clearSuggestions = () => {
    setQuery("")
  }

  return {
    query,
    setQuery,
    suggestions,
    loading: isLoading || isFetching,
    error: hasError ? 'Could not fetch suggestions' : null,
    clearSuggestions,
    // Extra info for debugging or monitoring API usage
    companiesLoading: companiesQuery.isLoading,
    universitiesLoading: universitiesQuery.isLoading,
    // Expose cache status for monitoring
    companiesCached: companiesQuery.isFetched && !companiesQuery.isFetching,
    universitiesCached: universitiesQuery.isFetched && !universitiesQuery.isFetching,
  }
}