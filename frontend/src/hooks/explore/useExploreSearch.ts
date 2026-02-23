import { useMemo } from "react";
import { useFuseSearch } from "@/hooks/search/useFuseSearch";
import { PRICE_RANGES } from "@/components/explore/types";
import type { UseExploreFiltersReturn } from "./useExploreFilters";
import type { MentorExplorePublic, MentorServicePublic, MentorSessionPublic } from "@/client";

interface UseExploreSearchParams {
  mentors: MentorExplorePublic[];
  sessions: MentorSessionPublic[];
  services: MentorServicePublic[];
  searchQuery: string;
  filters: UseExploreFiltersReturn;
}

export const useExploreSearch = ({
  mentors,
  sessions,
  services,
  searchQuery,
  filters,
}: UseExploreSearchParams) => {
  // Search with Fuse - using MentorExplorePublic structure
  const mentorFuseResults = useFuseSearch(mentors, searchQuery, {
    keys: [
      "full_name",
      "title",
      "about",
      "skills",
      "expertise",
      "area_of_focus"
    ],
    threshold: 0.3,
  });

  const sessionFuseResults = useFuseSearch(sessions, searchQuery, {
    keys: ["title", "description", "tags"],
    threshold: 0.3,
  });

  const serviceFuseResults = useFuseSearch(services, searchQuery, {
    keys: ["title", "description", "category", "highlights"],
    threshold: 0.3,
  });

  // Filter mentors
  const filteredMentors = useMemo(() => {
    let filtered = mentorFuseResults.map((r) => r.item);

    // Filter by expertise (multi-select)
    if (filters.selectedExpertise.length > 0) {
      filtered = filtered.filter((mentor) =>
        mentor.area_of_focus?.some((area: string) => 
          filters.selectedExpertise.includes(area)
        ) || mentor.expertise?.some((exp: string) =>
          filters.selectedExpertise.includes(exp)
        )
      );
    }

    // Filter by experience level (multi-select)
    if (filters.selectedExperience.length > 0) {
      filtered = filtered.filter((mentor) =>
        filters.selectedExperience.includes(mentor.experience_level)
      );
    }

    // Filter by availability
    if (filters.availableOnly) {
      filtered = filtered.filter((mentor) => mentor.is_available === true);
    }

    // Filter by price range (multi-select) - using avg_session_price
    if (filters.mentorPriceRange.length > 0) {
      filtered = filtered.filter((mentor) => {
        const avgPrice = mentor.avg_session_price;
        if (!avgPrice) return false;
        
        return filters.mentorPriceRange.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return avgPrice >= range.min && avgPrice <= range.max;
        });
      });
    }

    // Filter by direct min/max price
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter((mentor) => {
        const avgPrice = mentor.avg_session_price;
        if (!avgPrice && filters.minPrice) return false;
        if (!avgPrice) return true;
        
        const meetsMin = filters.minPrice === undefined || avgPrice >= filters.minPrice;
        const meetsMax = filters.maxPrice === undefined || avgPrice <= filters.maxPrice;
        
        return meetsMin && meetsMax;
      });
    }

    return filtered;
  }, [
    mentorFuseResults, 
    filters.selectedExpertise, 
    filters.selectedExperience, 
    filters.availableOnly,
    filters.mentorPriceRange,
    filters.minPrice,
    filters.maxPrice
  ]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessionFuseResults.map((r) => r.item);

    // Filter by location type
    if (filters.locationType) {
      filtered = filtered.filter((session) =>
        session.location_type === filters.locationType
      );
    }

    // Filter by price range (multi-select)
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

    // Filter by direct min/max price
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter((session) => {
        const price = session.price_usd || 0;
        const meetsMin = filters.minPrice === undefined || price >= filters.minPrice;
        const meetsMax = filters.maxPrice === undefined || price <= filters.maxPrice;
        return meetsMin && meetsMax;
      });
    }

    return filtered;
  }, [
    sessionFuseResults, 
    filters.locationType,
    filters.sessionPriceRange,
    filters.minPrice,
    filters.maxPrice
  ]);

  // Filter services
  const filteredServices = useMemo(() => {
    let filtered = serviceFuseResults.map((r) => r.item);

    // Filter by category (multi-select)
    if (filters.selectedServiceCategories.length > 0) {
      filtered = filtered.filter((service) =>
        filters.selectedServiceCategories.includes(service.category || "")
      );
    }

    // Filter by price range (multi-select)
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

    // Filter by direct min/max price
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter((service) => {
        const price = service.price_usd || 0;
        const meetsMin = filters.minPrice === undefined || price >= filters.minPrice;
        const meetsMax = filters.maxPrice === undefined || price <= filters.maxPrice;
        return meetsMin && meetsMax;
      });
    }

    return filtered;
  }, [
    serviceFuseResults, 
    filters.selectedServiceCategories,
    filters.servicePriceRange,
    filters.minPrice,
    filters.maxPrice
  ]);

  return {
    filteredMentors,
    filteredSessions,
    filteredServices,
  };
};