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
  

  // TODO: Make this private key on payments.
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
}

/**
 * Advanced version using useQueries for parallel fetching with individual caching
 * This gives you more control and better caching per source
 */
export function useInstitutionOrCompanySearch(
  options: UseInstitutionOrCompanySearchOptions = {}
) {
  const { 
    includeCompanies = true, 
    includeUniversities = true 
  } = options

  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 400)
  const shouldFetch = debouncedQuery.length >= 2

  // Use useQueries for parallel fetching with separate caching
  const queries = useQueries({
    queries: [
      {
        queryKey: ['companies', debouncedQuery],
        queryFn: () => fetchCompanies(debouncedQuery),
        enabled: shouldFetch && includeCompanies,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['universities', debouncedQuery],
        queryFn: () => fetchUniversities(debouncedQuery),
        enabled: shouldFetch && includeUniversities,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
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

    // Remove duplicates and limit to 8
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
    // Extra info for debugging or advanced use
    companiesLoading: companiesQuery.isLoading,
    universitiesLoading: universitiesQuery.isLoading,
  }
}