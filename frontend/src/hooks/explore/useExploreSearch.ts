import { useMemo } from "react";
import { useFuseSearch } from "@/hooks/search/useFuseSearch";
import { PRICE_RANGES } from "@/components/explore/types";
import type { UseExploreFiltersReturn } from "./useExploreFilters";
import type { MentorServicePublic, MentorSessionPublic, UserPublic } from "@/client";

interface UseExploreSearchParams {
  mentors: UserPublic[];
  featuredSessions: MentorSessionPublic[];
  featuredServices: MentorServicePublic[];
  searchQuery: string;
  filters: UseExploreFiltersReturn;
}

export const useExploreSearch = ({
  mentors,
  featuredSessions,
  featuredServices,
  searchQuery,
  filters,
}: UseExploreSearchParams) => {
  // Search with Fuse
  const mentorFuseResults = useFuseSearch(mentors, searchQuery, {
    keys: ["full_name", "profile.title", "profile.skills", "profile.about", "profile.area_of_focus"],
    threshold: 0.3,
  });

  const sessionFuseResults = useFuseSearch(featuredSessions, searchQuery, {
    keys: ["title", "description", "tags", "session_type"],
    threshold: 0.3,
  });

  const serviceFuseResults = useFuseSearch(featuredServices, searchQuery, {
    keys: ["title", "description", "category", "highlights"],
    threshold: 0.3,
  });

  // Filter mentors
  const filteredMentors = useMemo(() => {
    let filtered = mentorFuseResults.map((r) => r.item);

    if (filters.selectedExpertise.length > 0) {
      filtered = filtered.filter((mentor) =>
        mentor.profile?.area_of_focus?.some((area: string) => 
          filters.selectedExpertise.includes(area)
        )
      );
    }

    if (filters.selectedExperience.length > 0) {
      filtered = filtered.filter((mentor) =>
        filters.selectedExperience.includes(
          mentor.profile?.mentor_profile?.experience_level || ""
        )
      );
    }

    if (filters.mentorPriceRange.length > 0) {
      filtered = filtered.filter((mentor) => {
        const sessions = mentor.profile?.mentor_profile?.sessions || [];
        if (sessions.length === 0) return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prices = sessions.map((s: any) => s.price_usd || 0);
        const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
        return filters.mentorPriceRange.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return avgPrice >= range.min && avgPrice <= range.max;
        });
      });
    }

    return filtered;
  }, [mentorFuseResults, filters.selectedExpertise, filters.selectedExperience, filters.mentorPriceRange]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessionFuseResults.map((r) => r.item);

    if (filters.selectedSessionTypes.length > 0) {
      filtered = filtered.filter((session) =>
        filters.selectedSessionTypes.includes(session.session_type)
      );
    }

    if (filters.sessionPriceRange.length > 0) {
      filtered = filtered.filter((session) => {
        const price = session.price_usd || 0;
        return filters.sessionPriceRange.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return price >= range.min && price <= range.max;
        });
      });
    }

    return filtered;
  }, [sessionFuseResults, filters.selectedSessionTypes, filters.sessionPriceRange]);

  // Filter services
  const filteredServices = useMemo(() => {
    let filtered = serviceFuseResults.map((r) => r.item);

    if (filters.selectedServiceCategories.length > 0) {
      filtered = filtered.filter((service) =>
        filters.selectedServiceCategories.includes(service.category || "")
      );
    }

    if (filters.servicePriceRange.length > 0) {
      filtered = filtered.filter((service) => {
        const price = service.price_usd || 0;
        return filters.servicePriceRange.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return price >= range.min && price <= range.max;
        });
      });
    }

    return filtered;
  }, [serviceFuseResults, filters.selectedServiceCategories, filters.servicePriceRange]);

  return {
    filteredMentors,
    filteredSessions,
    filteredServices,
  };
};