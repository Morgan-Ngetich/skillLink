import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/search/useDebounce";
import { useFuseSearch } from "@/hooks/search/useFuseSearch";
import { usePublicMentors } from "@/hooks/public/usePublicMentors";
import type { UnifiedSearchResult, SearchResultType } from "@/components/common/search/types";

export const useSearchResults = (search: string) => {
  const [unifiedResults, setUnifiedResults] = useState<UnifiedSearchResult[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const {
    mentors = [],
    featuredSessions = [],
    featuredServices = [],
    isLoading,
  } = usePublicMentors({ limit: 50 });

  const mentorResults = useFuseSearch(mentors, debouncedSearch, {
    keys: ["full_name", "profile.title", "profile.skills", "profile.about", "profile.area_of_focus"],
    threshold: 0.3,
  });

  const sessionResults = useFuseSearch(featuredSessions, debouncedSearch, {
    keys: ["title", "description", "tags", "session_type"],
    threshold: 0.3,
  });

  const serviceResults = useFuseSearch(featuredServices, debouncedSearch, {
    keys: ["title", "description", "category", "highlights"],
    threshold: 0.3,
  });

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

    combined.sort((a, b) => a.score - b.score);
    setUnifiedResults(combined.slice(0, 10));
  }, [debouncedSearch, mentorResults, sessionResults, serviceResults]);

  return { unifiedResults, isLoading };
};