import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks/search/useDebounce";
import { useFuseSearch } from "@/hooks/search/useFuseSearch";
import { useBrowseMentors, useBrowseSessions, useBrowseServices } from "@/hooks/public/usePublicMentors";
import type { UnifiedSearchResult, SearchResultType } from "@/components/common/search/types";

interface UseSearchResultsParams {
  search: string;
  limit?: number;
  types?: SearchResultType[];
  enabled?: boolean;
}

export const useSearchResults = ({ search, limit = 10, types = ["mentor", "session", "service"], enabled = true }: UseSearchResultsParams) => {
  const [unifiedResults, setUnifiedResults] = useState<UnifiedSearchResult[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const { data: mentors = [], isLoading: isLoadingMentors, isError: isErrorMentors } = useBrowseMentors({ limit: 100, enabled: enabled && types.includes("mentor") });
  const { data: sessions = [], isLoading: isLoadingSessions, isError: isErrorSessions } = useBrowseSessions({ limit: 100, enabled: enabled && types.includes("session") });
  const { data: services = [], isLoading: isLoadingServices, isError: isErrorServices } = useBrowseServices({ limit: 100, enabled: enabled && types.includes("service") });

  // Run Fuse searches at top level
  const rawMentorResults = useFuseSearch(mentors, debouncedSearch, { keys: ["full_name","title","skills","about","area_of_focus"], threshold: 0.3, includeScore: true, minMatchCharLength: 2 });
  const rawSessionResults = useFuseSearch(sessions, debouncedSearch, { keys: ["title","description","tags","session_type"], threshold: 0.3, includeScore: true, minMatchCharLength: 2 });
  const rawServiceResults = useFuseSearch(services, debouncedSearch, { keys: ["title","description","category","highlights"], threshold: 0.3, includeScore: true, minMatchCharLength: 2 });

  // Memoized mapping
  const mentorResults = useMemo(() => rawMentorResults.map(r => ({ type: "mentor" as SearchResultType, data: r.item, score: r.score ?? 1, matches: r.matches, refIndex: r.refIndex })), [rawMentorResults]);
  const sessionResults = useMemo(() => rawSessionResults.map(r => ({ type: "session" as SearchResultType, data: r.item, score: r.score ?? 1, matches: r.matches, refIndex: r.refIndex })), [rawSessionResults]);
  const serviceResults = useMemo(() => rawServiceResults.map(r => ({ type: "service" as SearchResultType, data: r.item, score: r.score ?? 1, matches: r.matches, refIndex: r.refIndex })), [rawServiceResults]);

  // Memoize combined results
  const combinedResults = useMemo(() => {
    if (!enabled || !debouncedSearch.trim()) return [];
    const combined = [
      ...(types.includes("mentor") ? mentorResults : []),
      ...(types.includes("session") ? sessionResults : []),
      ...(types.includes("service") ? serviceResults : []),
    ];
    combined.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
    return combined.slice(0, limit);
  }, [mentorResults, sessionResults, serviceResults, types, limit, debouncedSearch, enabled]);

  // Only set state if changed
  useEffect(() => {
    setUnifiedResults(prev => {
      const prevStr = JSON.stringify(prev);
      const newStr = JSON.stringify(combinedResults);
      return prevStr === newStr ? prev : combinedResults;
    });
  }, [combinedResults]);

  return {
    unifiedResults,
    isLoading: isLoadingMentors || isLoadingSessions || isLoadingServices,
    isError: isErrorMentors || isErrorSessions || isErrorServices,
    searchStats: {
      mentors: mentorResults.length,
      sessions: sessionResults.length,
      services: serviceResults.length,
      total: unifiedResults.length,
    },
  };
};
