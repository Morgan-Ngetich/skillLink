import { Text, SimpleGrid } from "@chakra-ui/react";
import { MentorCard } from "@/components/dashboard/mentor/MentorCard";
import SessionCard from "@/components/dashboard/mentor/sessions/SessionCard";
import ServiceCard from "@/components/dashboard/mentor/services/ServiceCard";
import { EmptyState } from "./EmptyState";
import type { ViewType } from "./types";
import type { MentorExplorePublic, MentorServicePublic, MentorSessionPublic } from "@/client";
import { SessionCardSkeleton } from "../dashboard/mentor/sessions/SessionCardSkeleton";
import { ServiceCardSkeleton } from "../dashboard/mentor/services/ServiceCardSkeleton";
import { MentorCardSkeleton } from "@/skeletons/homePage/MentorCardSkeleton";

interface ExploreContentProps {
  currentView: ViewType;
  isLoadingMentors: boolean;
  isLoadingFeaturedSessions: boolean;
  isLoadingFeaturedServices: boolean;
  filteredMentors: MentorExplorePublic[];
  filteredSessions: MentorSessionPublic[];
  filteredServices: MentorServicePublic[];
  searchQuery: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
  userId?: number;
}

export const ExploreContent = ({
  currentView,
  isLoadingMentors,
  isLoadingFeaturedSessions,
  isLoadingFeaturedServices,
  filteredMentors,
  filteredSessions,
  filteredServices,
  searchQuery,
  hasActiveFilters,
  onClearFilters,
  onClearSearch,
  userId,
}: ExploreContentProps) => {
  const renderResultsCount = () => {
    if (currentView === "mentors") {
      return `${filteredMentors.length} ${filteredMentors.length === 1 ? "mentor" : "mentors"}`;
    }
    if (currentView === "sessions") {
      return `${filteredSessions.length} ${filteredSessions.length === 1 ? "session" : "sessions"}`;
    }
    return `${filteredServices.length} ${filteredServices.length === 1 ? "service" : "services"}`;
  };

  return (
    <>
      <Text fontSize="sm" color="fg.muted" mb={4}>
        {renderResultsCount()}
      </Text>

      {currentView === "mentors" && (
        <>
          {isLoadingMentors ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={{ base: 4, md: 6 }}>
              {[...Array(8)].map((_, i) => (
                <MentorCardSkeleton key={i} />
              ))}
            </SimpleGrid>
          ) : filteredMentors.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={{ base: 4, md: 6 }}>
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.user_id} mentor={mentor} />
              ))}
            </SimpleGrid>
          ) : (
            <EmptyState
              title="No mentors found"
              hasActiveFilters={hasActiveFilters}
              searchQuery={searchQuery}
              onClearFilters={onClearFilters}
              onClearSearch={onClearSearch}
            />
          )}
        </>
      )}

      {currentView === "sessions" && (
        <>
          {isLoadingFeaturedSessions ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, md: 6 }}>
              {[...Array(6)].map((_, i) => (
                <SessionCardSkeleton key={i} />
              ))}
            </SimpleGrid>
          ) : filteredSessions.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, md: 6 }}>
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  showActions={userId === session?.mentor_id}
                  isFromExplore={true}
                />
              ))}
            </SimpleGrid>
          ) : (
            <EmptyState
              title="No sessions found"
              hasActiveFilters={hasActiveFilters}
              searchQuery={searchQuery}
              onClearFilters={onClearFilters}
              onClearSearch={onClearSearch}
            />
          )}
        </>
      )}

      {currentView === "services" && (
        <>
          {isLoadingFeaturedServices ? (
            <SimpleGrid columns={{ base: 2, sm: 3, lg: 4, xl: 5 }} gap={{ base: 2, md: 6 }}>
              {[...Array(10)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </SimpleGrid>
          ) : filteredServices.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, lg: 4, xl: 5 }} gap={{ base: 2, md: 6 }}>
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} showActions={userId === service?.mentor_id} />
              ))}
            </SimpleGrid>
          ) : (
            <EmptyState
              title="No services found"
              hasActiveFilters={hasActiveFilters}
              searchQuery={searchQuery}
              onClearFilters={onClearFilters}
              onClearSearch={onClearSearch}
            />
          )}
        </>
      )}
    </>
  );
};