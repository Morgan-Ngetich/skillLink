// hooks/useDocsSearch.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Fuse, { type FuseResultMatch, type IFuseOptions } from 'fuse.js';
import { type SearchableDoc } from '../types/search';

export interface SearchResult extends SearchableDoc {
  score?: number;
  matches?: readonly FuseResultMatch[];
  highlightedTitle?: string;
  highlightedExcerpt?: string;
  highlightedContent?: string;
}

export interface SearchFilters {
  sections?: string[];
  tags?: string[];
  headingLevels?: number[];
}

export interface SearchOptions {
  maxResults?: number;
  includeContent?: boolean;
  groupBySection?: boolean;
}

const fuseOptions: IFuseOptions<SearchableDoc> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.25 },
    { name: 'excerpt', weight: 0.2 },
    { name: 'headings.text', weight: 0.1 },
    { name: 'section', weight: 0.03 },
    { name: 'tags', weight: 0.02 }
  ],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  fieldNormWeight: 1
};

// Query function to load search data
async function loadSearchData(): Promise<SearchableDoc[]> {
  try {
    const searchData = await import('../data/searchData.json');
    const documents = searchData.default || searchData;
    
    if (!Array.isArray(documents)) {
      throw new Error('Invalid search data format');
    }
    
    return documents;
  } catch (error) {
    console.error('Failed to load search data:', error);
    throw new Error('Failed to load search data');
  }
}

export function useDocsSearch(options: SearchOptions = {}) {
  const {
    maxResults = 20,
    includeContent = false,
    groupBySection = false
  } = options;

  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Load search documents using TanStack Query
  const {
    data: searchableDocuments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['searchData'],
    queryFn: loadSearchData,
    staleTime: 1000 * 60 * 60, // 1 hour - search data doesn't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache time
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Debounced search execution
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query using TanStack Query with debounced input
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError
  } = useQuery({
    queryKey: ['searchResults', debouncedQuery, filters, maxResults, includeContent, groupBySection],
    queryFn: () => performSearch({
      query: debouncedQuery,
      documents: searchableDocuments,
      filters,
      maxResults,
      includeContent,
      groupBySection
    }),
    enabled: !!debouncedQuery.trim() && searchableDocuments.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get available metadata for filters
  const availableSections = useMemo(() => {
    const sections = new Set(searchableDocuments.map(doc => doc.section));
    return Array.from(sections).sort();
  }, [searchableDocuments]);

  const availableTags = useMemo(() => {
    const tags = new Set(searchableDocuments.flatMap(doc => doc.tags));
    return Array.from(tags).sort();
  }, [searchableDocuments]);

  const availableHeadingLevels = useMemo(() => {
    const levels = new Set(
      searchableDocuments.flatMap(doc => doc.headings.map(h => h.level))
    );
    return Array.from(levels).sort((a, b) => a - b);
  }, [searchableDocuments]);

  // Search suggestions based on available content
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    
    const queryLower = query.toLowerCase();
    const titleMatches = searchableDocuments
      .filter(doc => doc.title.toLowerCase().includes(queryLower))
      .map(doc => doc.title)
      .slice(0, 5);
    
    const tagMatches = availableTags
      .filter(tag => tag.toLowerCase().includes(queryLower))
      .slice(0, 3);
    
    return [...new Set([...titleMatches, ...tagMatches])];
  }, [query, searchableDocuments, availableTags]);

  // Search state management
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setFilters({});
    // Optionally clear search results cache
    queryClient.removeQueries({ 
      queryKey: ['searchResults'], 
      type: 'all' 
    });
  }, [queryClient]);

  // Prefetch popular searches or sections
  const prefetchSection = useCallback((section: string) => {
    queryClient.prefetchQuery({
      queryKey: ['searchResults', '', { sections: [section] }, maxResults, includeContent, groupBySection],
      queryFn: () => performSearch({
        query: '',
        documents: searchableDocuments.filter(doc => doc.section === section),
        filters: { sections: [section] },
        maxResults,
        includeContent,
        groupBySection
      }),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [queryClient, searchableDocuments, maxResults, includeContent, groupBySection]);

  return {
    // Search state
    query,
    debouncedQuery,
    searchResults,
    isSearching: isSearching || (query !== debouncedQuery),
    isLoading,
    error: error || searchError,
    
    // Filter state
    filters,
    availableSections,
    availableTags,
    availableHeadingLevels,
    
    // Search actions
    updateQuery,
    updateFilters,
    clearFilters,
    clearSearch,
    refetch, // Refetch search data
    prefetchSection, // Prefetch section data
    
    // Results metadata
    hasResults: searchResults.length > 0,
    totalResults: searchResults.length,
    suggestions,
    
    // Utility
    isEmpty: !query.trim() && Object.keys(filters).every(key => 
      !filters[key as keyof SearchFilters]?.length
    )
  };
}

// Search execution function (extracted for TanStack Query)
async function performSearch({
  query,
  documents,
  filters,
  maxResults,
  includeContent,
  groupBySection
}: {
  query: string;
  documents: SearchableDoc[];
  filters: SearchFilters;
  maxResults: number;
  includeContent: boolean;
  groupBySection: boolean;
}): Promise<SearchResult[]> {
  if (!query.trim() || !documents.length) {
    return [];
  }

  // Apply filters to documents
  let filteredDocuments = documents;
  
  if (filters.sections?.length) {
    filteredDocuments = filteredDocuments.filter(doc => 
      filters.sections!.includes(doc.section)
    );
  }
  
  if (filters.tags?.length) {
    filteredDocuments = filteredDocuments.filter(doc => 
      filters.tags!.some(tag => doc.tags.includes(tag))
    );
  }

  if (filters.headingLevels?.length) {
    filteredDocuments = filteredDocuments.filter(doc =>
      doc.headings.some(heading =>
        filters.headingLevels!.includes(heading.level)
      )
    );
  }

  // Create Fuse instance and search
  const fuse = new Fuse(filteredDocuments, fuseOptions);
  const results = fuse.search(query, { limit: maxResults });
  
  const processedResults = results.map((result): SearchResult => {
    const doc = result.item;
    
    // Create highlighted versions
    const highlightedTitle = highlightMatches(doc.title, result.matches, 'title');
    const highlightedExcerpt = highlightMatches(doc.excerpt, result.matches, 'excerpt');
    const highlightedContent = includeContent 
      ? highlightMatches(doc.content.substring(0, 300), result.matches, 'content')
      : undefined;
    
    return {
      ...doc,
      score: result.score,
      matches: result.matches,
      highlightedTitle,
      highlightedExcerpt,
      highlightedContent
    };
  });

  // Group by section if requested
  if (groupBySection) {
    return groupResultsBySection(processedResults);
  }

  return processedResults;
}

// Helper function to highlight search matches
function highlightMatches(
  text: string, 
  matches?: readonly FuseResultMatch[], 
  key?: string
): string {
  if (!matches || !key || !text) return text;
  
  const match = matches.find(m => m.key === key);
  if (!match || !match.indices?.length) return text;

  let highlightedText = text;
  
  // Sort indices by start position (descending) to avoid offset issues
  const sortedIndices = [...match.indices].sort((a, b) => b[0] - a[0]);

  for (const [start, end] of sortedIndices) {
    // Ensure indices are within bounds
    if (start >= text.length || end >= text.length) continue;
    
    const before = highlightedText.slice(0, start);
    const highlighted = highlightedText.slice(start, end + 1);
    const after = highlightedText.slice(end + 1);
    
    highlightedText = `${before}<mark class="search-highlight">${highlighted}</mark>${after}`;
  }

  return highlightedText;
}

// Group search results by section
function groupResultsBySection(results: SearchResult[]) {
  const grouped = results.reduce((acc, result) => {
    const section = result.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Convert to flat array with section headers
  const flattened: SearchResult[] = [];
  
  Object.keys(grouped)
    .sort()
    .forEach(section => {
      flattened.push({
        id: `section-${section}`,
        title: section,
        content: '',
        excerpt: '',
        url: '',
        section: section,
        tags: [],
        headings: [],
        isSectionHeader: true
      } as SearchResult & { isSectionHeader: boolean });
      
      flattened.push(...grouped[section]);
    });

  return flattened;
}