import { useState } from "react";
import type { ViewType } from "@/components/explore/types";

export interface UseExploreFiltersReturn {
  // Mentor filters
  selectedExpertise: string[];
  selectedExperience: string[];
  mentorPriceRange: string[];
  availableOnly: boolean;
  
  // Session filters
  selectedSessionTypes: string[];
  sessionPriceRange: string[];
  
  // Service filters
  selectedServiceCategories: string[];
  servicePriceRange: string[];
  
  // Actions
  toggleExpertise: (expertise: string) => void;
  toggleExperience: (level: string) => void;
  toggleMentorPrice: (range: string) => void;
  setAvailableOnly: (available: boolean) => void;
  toggleSessionType: (type: string) => void;
  toggleSessionPrice: (range: string) => void;
  toggleServiceCategory: (category: string) => void;
  toggleServicePrice: (range: string) => void;
  clearAll: () => void;
  getActiveFilterCount: (view: ViewType) => number;
}

export const useExploreFilters = (): UseExploreFiltersReturn => {
  // Mentor filters
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [mentorPriceRange, setMentorPriceRange] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Session filters
  const [selectedSessionTypes, setSelectedSessionTypes] = useState<string[]>([]);
  const [sessionPriceRange, setSessionPriceRange] = useState<string[]>([]);

  // Service filters
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [servicePriceRange, setServicePriceRange] = useState<string[]>([]);

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise) ? prev.filter((e) => e !== expertise) : [...prev, expertise]
    );
  };

  const toggleExperience = (level: string) => {
    setSelectedExperience((prev) =>
      prev.includes(level) ? prev.filter((e) => e !== level) : [...prev, level]
    );
  };

  const toggleMentorPrice = (range: string) => {
    setMentorPriceRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleSessionType = (type: string) => {
    setSelectedSessionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSessionPrice = (range: string) => {
    setSessionPriceRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleServiceCategory = (category: string) => {
    setSelectedServiceCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleServicePrice = (range: string) => {
    setServicePriceRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const clearAll = () => {
    setSelectedExpertise([]);
    setSelectedExperience([]);
    setMentorPriceRange([]);
    setAvailableOnly(false);
    setSelectedSessionTypes([]);
    setSessionPriceRange([]);
    setSelectedServiceCategories([]);
    setServicePriceRange([]);
  };

  const getActiveFilterCount = (view: ViewType): number => {
    if (view === "mentors") {
      return (
        selectedExpertise.length +
        selectedExperience.length +
        mentorPriceRange.length +
        (availableOnly ? 1 : 0)
      );
    }
    if (view === "sessions") {
      return selectedSessionTypes.length + sessionPriceRange.length;
    }
    return selectedServiceCategories.length + servicePriceRange.length;
  };

  return {
    selectedExpertise,
    selectedExperience,
    mentorPriceRange,
    availableOnly,
    selectedSessionTypes,
    sessionPriceRange,
    selectedServiceCategories,
    servicePriceRange,
    toggleExpertise,
    toggleExperience,
    toggleMentorPrice,
    setAvailableOnly,
    toggleSessionType,
    toggleSessionPrice,
    toggleServiceCategory,
    toggleServicePrice,
    clearAll,
    getActiveFilterCount,
  };
};