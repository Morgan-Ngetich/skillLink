import { useState, useCallback, useMemo } from "react";
import type { ViewType } from "@/components/explore/types";
import { type LocationType } from "@/client";

export interface ExploreFilters {
  // Common filters
  minPrice?: number;
  maxPrice?: number;
  availableOnly: boolean;

  // Mentor filters (arrays for multi-select)
  selectedExpertise: string[];
  selectedExperience: string[];
  mentorPriceRange: string[];

  // Session filters (arrays for multi-select)
  selectedSessionTypes: string[];
  sessionPriceRange: string[];
  locationType?: LocationType;

  // Service filters (arrays for multi-select)
  selectedServiceCategories: string[];
  servicePriceRange: string[];
}

export interface UseExploreFiltersReturn extends ExploreFilters {
  setMinPrice: (price?: number) => void;
  setMaxPrice: (price?: number) => void;
  setAvailableOnly: (available: boolean) => void;
  setLocationType: (type?: LocationType) => void;

  // Toggle helpers for multi-select
  toggleExpertise: (item: string) => void;
  toggleExperience: (item: string) => void;
  toggleMentorPrice: (item: string) => void;
  toggleSessionType: (item: string) => void;
  toggleSessionPrice: (item: string) => void;
  toggleServiceCategory: (item: string) => void;
  toggleServicePrice: (item: string) => void;

  // Helper methods
  clearAll: () => void;
  clearViewFilters: (view: ViewType) => void;
  getActiveFilterCount: (view: ViewType) => number;
  hasActiveFilters: () => boolean;
  toQueryParams: () => Record<string, string | number | boolean>;
}

export const useExploreFilters = (initialFilters?: Partial<ExploreFilters>): UseExploreFiltersReturn => {
  const [filters, setFilters] = useState<ExploreFilters>({
    availableOnly: false,
    selectedExpertise: [],
    selectedExperience: [],
    mentorPriceRange: [],
    selectedSessionTypes: [],
    sessionPriceRange: [],
    selectedServiceCategories: [],
    servicePriceRange: [],
    ...initialFilters,
  });

  const updateFilter = useCallback(<K extends keyof ExploreFilters>(
    key: K,
    value: ExploreFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Toggle helpers for array filters
  const toggleArrayFilter = useCallback((key: keyof ExploreFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray,
      };
    });
  }, []);

  const toggleExpertise = useCallback((item: string) => toggleArrayFilter("selectedExpertise", item), [toggleArrayFilter]);
  const toggleExperience = useCallback((item: string) => toggleArrayFilter("selectedExperience", item), [toggleArrayFilter]);
  const toggleMentorPrice = useCallback((item: string) => toggleArrayFilter("mentorPriceRange", item), [toggleArrayFilter]);
  const toggleSessionType = useCallback((item: string) => toggleArrayFilter("selectedSessionTypes", item), [toggleArrayFilter]);
  const toggleSessionPrice = useCallback((item: string) => toggleArrayFilter("sessionPriceRange", item), [toggleArrayFilter]);
  const toggleServiceCategory = useCallback((item: string) => toggleArrayFilter("selectedServiceCategories", item), [toggleArrayFilter]);
  const toggleServicePrice = useCallback((item: string) => toggleArrayFilter("servicePriceRange", item), [toggleArrayFilter]);

  const clearAll = useCallback(() => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      availableOnly: false,
      selectedExpertise: [],
      selectedExperience: [],
      mentorPriceRange: [],
      selectedSessionTypes: [],
      sessionPriceRange: [],
      locationType: undefined,
      selectedServiceCategories: [],
      servicePriceRange: [],
    });
  }, []);

  const clearViewFilters = useCallback((view: ViewType) => {
    setFilters(prev => {
      const newFilters = { ...prev };

      switch (view) {
        case "mentors":
          newFilters.selectedExpertise = [];
          newFilters.selectedExperience = [];
          newFilters.mentorPriceRange = [];
          break;
        case "sessions":
          newFilters.selectedSessionTypes = [];
          newFilters.sessionPriceRange = [];
          newFilters.locationType = undefined;
          break;
        case "services":
          newFilters.selectedServiceCategories = [];
          newFilters.servicePriceRange = [];
          break;
      }

      return newFilters;
    });
  }, []);

  const getActiveFilterCount = useCallback((view: ViewType): number => {
    let count = 0;

    // Common filters
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.availableOnly) count++;

    // View-specific filters
    switch (view) {
      case "mentors":
        count += filters.selectedExpertise.length;
        count += filters.selectedExperience.length;
        count += filters.mentorPriceRange.length;
        break;
      case "sessions":
        count += filters.selectedSessionTypes.length;
        count += filters.sessionPriceRange.length;
        if (filters.locationType) count++;
        break;
      case "services":
        count += filters.selectedServiceCategories.length;
        count += filters.servicePriceRange.length;
        break;
    }

    return count;
  }, [filters]);

  const hasActiveFilters = useCallback(() => {
    return getActiveFilterCount("mentors") > 0 ||
      getActiveFilterCount("sessions") > 0 ||
      getActiveFilterCount("services") > 0;
  }, [getActiveFilterCount]);

  const toQueryParams = useCallback(() => {
    const params: Record<string, string | number | boolean> = {};

    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters.availableOnly) params.availableOnly = true;
    if (filters.selectedExpertise.length > 0) params.expertise = filters.selectedExpertise.join(',');
    if (filters.selectedExperience.length > 0) params.experience = filters.selectedExperience.join(',');
    if (filters.mentorPriceRange.length > 0) params.mentorPriceRange = filters.mentorPriceRange.join(',');
    if (filters.selectedSessionTypes.length > 0) params.sessionTypes = filters.selectedSessionTypes.join(',');
    if (filters.sessionPriceRange.length > 0) params.sessionPriceRange = filters.sessionPriceRange.join(',');
    if (filters.locationType) params.locationType = filters.locationType;
    if (filters.selectedServiceCategories.length > 0) params.serviceCategories = filters.selectedServiceCategories.join(',');
    if (filters.servicePriceRange.length > 0) params.servicePriceRange = filters.servicePriceRange.join(',');

    return params;
  }, [filters]);

  return useMemo(() => ({
    ...filters,

    // Setters
    setMinPrice: (price) => updateFilter("minPrice", price),
    setMaxPrice: (price) => updateFilter("maxPrice", price),
    setAvailableOnly: (available) => updateFilter("availableOnly", available),
    setLocationType: (type) => updateFilter("locationType", type),

    // Toggle helpers
    toggleExpertise,
    toggleExperience,
    toggleMentorPrice,
    toggleSessionType,
    toggleSessionPrice,
    toggleServiceCategory,
    toggleServicePrice,

    // Helpers
    clearAll,
    clearViewFilters,
    getActiveFilterCount,
    hasActiveFilters,
    toQueryParams,
  }), [
    filters, 
    updateFilter, 
    toggleExpertise,
    toggleExperience,
    toggleMentorPrice,
    toggleSessionType,
    toggleSessionPrice,
    toggleServiceCategory,
    toggleServicePrice,
    clearAll, 
    clearViewFilters, 
    getActiveFilterCount, 
    hasActiveFilters, 
    toQueryParams
  ]);
};