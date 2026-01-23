import { Box, Container, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useBrowseMentors, useBrowseSessions, useBrowseServices } from "@/hooks/public/usePublicMentors";
import { useAuth } from "@/hooks/auth/useAuth";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { ExploreContent } from "@/components/explore/ExploreContent";
import { FilterDrawer } from "@/components/explore/FilterDrawer";
import { useExploreFilters } from "@/hooks/explore/useExploreFilters";
import { useExploreSearch } from "@/hooks/explore/useExploreSearch";
import type { ViewType } from "@/components/explore/types";

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use useSearch to get typed search params
  const searchParams = useSearch({ strict: false });
  const searchQuery = searchParams.q || "";
  const viewParam = searchParams.view as ViewType | null;
  const sessionId = searchParams.sessionId;
  const serviceId = searchParams.serviceId;

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
  const {
    data: mentors = [],
    isLoading: isLoadingMentors
  } = useBrowseMentors({
    expertise: filters.selectedExpertise.length > 0 ? filters.selectedExpertise[0] : undefined,
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

  // Apply client-side filtering
  const { filteredMentors, filteredSessions, filteredServices } = useExploreSearch({
    mentors,
    sessions,
    services,
    searchQuery,
    filters,
  });

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    // Use navigate with search object directly
    navigate({ 
      to: "/explore", 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: (prev: Record<string, any>) => ({ 
        ...prev, 
        view, 
        sessionId: undefined, // Remove these params
        serviceId: undefined 
      }) 
    });
  };

  const clearSearch = () => {
    // Use navigate with search object
    navigate({ 
      to: "/explore", 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: (prev: Record<string, any>) => ({ 
        ...prev, 
        q: undefined // Remove the q param
      }) 
    });
  };

  useEffect(() => {
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
  }, [sessionId, serviceId]); // Update dependencies

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