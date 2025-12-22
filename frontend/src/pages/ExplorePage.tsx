import { Box, Container, VStack } from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useBrowseMentors, useBrowseSessions, useBrowseServices } from "@/hooks/public/usePublicMentors";
import { useAuth } from "@/hooks/auth/useAuth";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { ExploreContent } from "@/components/explore/ExploreContent";
import { FilterDrawer } from "@/components/explore/FilterDrawer";
import { useExploreFilters } from "@/hooks/explore/useExploreFilters";
import { useExploreSearch } from "@/hooks/explore/useExploreSearch";
import type { ViewType } from "@/components/explore/types";

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQuery = urlParams.get("q") || "";
  const viewParam = urlParams.get("view") as ViewType | null;

  const [currentView, setCurrentView] = useState<ViewType>(viewParam || "mentors");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filters = useExploreFilters();

  useEffect(() => {
    const newView = viewParam || "mentors";
    if (newView !== currentView) {
      setCurrentView(newView);
    }
  }, [currentView, viewParam]);

  // Fetch data for browsing with filter parameters
  // API only supports single values, so we pass the first selected item
  const {
    data: mentors = [],
    isLoading: isLoadingMentors
  } = useBrowseMentors({
    expertise: filters.selectedExpertise.length > 0 ? filters.selectedExpertise[0] : undefined,
    // Only pass available if the user explicitly wants to filter
    ...(filters.availableOnly ? { available: true } : {}),
    limit: 100,
  });

  const {
    data: sessions = [],
    isLoading: isLoadingFeaturedSessions
  } = useBrowseSessions({
    sessionType: filters.selectedSessionTypes.length > 0 ? filters.selectedSessionTypes[0] : undefined,
    locationType: filters.locationType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    limit: 100,
  });

  const {
    data: services = [],
    isLoading: isLoadingFeaturedServices
  } = useBrowseServices({
    category: filters.selectedServiceCategories.length > 0 ? filters.selectedServiceCategories[0] : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    limit: 100,
  });

  // Apply client-side filtering for ALL selected filters (multi-select support)
  const { filteredMentors, filteredSessions, filteredServices } = useExploreSearch({
    mentors,
    sessions,
    services,
    searchQuery,
    filters,
  });

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    const newParams = new URLSearchParams(location.search);
    newParams.set("view", view);
    newParams.delete("sessionId");
    newParams.delete("serviceId");
    navigate({ to: "/explore", search: Object.fromEntries(newParams) });
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(location.search);
    newParams.delete("q");
    navigate({ to: "/explore", search: Object.fromEntries(newParams) });
  };

  useEffect(() => {
    const sessionId = urlParams.get("sessionId");
    const serviceId = urlParams.get("serviceId");

    if (!sessionId && !serviceId) return;

    const timeoutId = setTimeout(() => {
      if (sessionId) {
        document.getElementById(`session-${sessionId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
      if (serviceId) {
        document.getElementById(`service-${serviceId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [urlParams]);

  return (
    <Box minH="100vh">
      <Container maxW="8xl" py={{ base: 4, md: 6 }}>
        <VStack align="stretch" gap={4} mb={6}>
          <ExploreHeader
            searchQuery={searchQuery}
            currentView={currentView}
            activeFilterCount={filters.getActiveFilterCount(currentView)}
            onClearSearch={clearSearch}
            onOpenFilters={() => setIsFilterOpen(true)}
            onViewChange={handleViewChange}
          />
        </VStack>

        <ExploreContent
          currentView={currentView}
          isLoadingMentors={isLoadingMentors}
          isLoadingFeaturedSessions={isLoadingFeaturedSessions}
          isLoadingFeaturedServices={isLoadingFeaturedServices}
          filteredMentors={filteredMentors}
          filteredSessions={filteredSessions}
          filteredServices={filteredServices}
          searchQuery={searchQuery}
          hasActiveFilters={filters.getActiveFilterCount(currentView) > 0}
          onClearFilters={filters.clearAll}
          onClearSearch={clearSearch}
          userId={user?.id}
        />
      </Container>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentView={currentView}
        filters={filters}
        resultCounts={{
          mentors: filteredMentors.length,
          sessions: filteredSessions.length,
          services: filteredServices.length,
        }}
      />
    </Box>
  );
};

export default Explore;