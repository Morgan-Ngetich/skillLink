import { useQuery } from '@tanstack/react-query';
import {
  PublicService,
  MentorsService,
  type MentorExplorePublic,
  type MentorSessionPublic,
  type MentorServicePublic,
  type LocationType,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';

interface UseMentorsParams {
  expertise?: string;
  available?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseSessionsParams {
  sessionType?: string;
  locationType?: LocationType;
  tag?: string;
  mentorExpertise?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  fromTime?: string;
  toTime?: string;
  onlyAvailable?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseServicesParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook for browsing mentors (explore page)
 * Returns lightweight public info optimized for listing
 */
export const useBrowseMentors = (params?: UseMentorsParams) => {
  const {
    expertise,
    available,
    limit = 20,
    offset = 0,
    enabled = true,
  } = params || {};

  return useQuery<MentorExplorePublic[], Error>({
    queryKey: ['browseMentors', expertise, available, limit, offset],
    queryFn: () =>
      toNativePromise(
        PublicService.browseMentorsApiV1PublicMentorsGet({
          expertise,
          available,
          limit,
          offset,
        })
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes - public data doesn't change often
    retry: 2,
    enabled,
  });
};

/**
 * Hook for browsing sessions with advanced filtering
 */
export const useBrowseSessions = (params?: UseSessionsParams) => {
  const {
    sessionType,
    locationType,
    tag,
    mentorExpertise,
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    fromTime,
    toTime,
    onlyAvailable = false,
    limit = 20,
    offset = 0,
    enabled = true,
  } = params || {};

  return useQuery<MentorSessionPublic[], Error>({
    queryKey: [
      'browseSessions',
      sessionType,
      locationType,
      tag,
      mentorExpertise,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      fromTime,
      toTime,
      onlyAvailable,
      limit,
      offset,
    ],
    queryFn: () =>
      toNativePromise(
        PublicService.browseSessionsApiV1PublicSessionsGet({
          sessionType,
          locationType,
          tag,
          mentorExpertise,
          minPrice,
          maxPrice,
          minDuration,
          maxDuration,
          fromTime,
          toTime,
          onlyAvailable,
          limit,
          offset,
        })
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled,
  });
};

/**
 * Hook for browsing services with filtering
 */
export const useBrowseServices = (params?: UseServicesParams) => {
  const {
    category,
    minPrice,
    maxPrice,
    limit = 20,
    offset = 0,
    enabled = true,
  } = params || {};

  return useQuery<MentorServicePublic[], Error>({
    queryKey: ['browseServices', category, minPrice, maxPrice, limit, offset],
    queryFn: () =>
      toNativePromise(
        PublicService.browseServicesApiV1PublicServicesGet({
          category,
          minPrice,
          maxPrice,
          limit,
          offset,
        })
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled,
  });
};


interface InitialFeaturedData {
  mentors?: MentorExplorePublic[];
  sessions?: MentorSessionPublic[];
  services?: MentorServicePublic[];
}

interface UsePublicMentorsOptions {
  enabled?: boolean;
  initialData?: InitialFeaturedData;
}

/**
 * Hook for public mentor discovery and exploration
 * Fetches featured content for homepage
 */

export const usePublicMentors = (
  options: UsePublicMentorsOptions = {}
) => {
  const { enabled = true, initialData } = options;

  // Featured mentors (homepage)
  const featuredMentorsQuery = useQuery<MentorExplorePublic[], Error>({
    queryKey: ['featuredMentors'],
    queryFn: () => toNativePromise(
      PublicService.getFeaturedMentorsApiV1PublicFeaturedMentorsGet()
    ),
    staleTime: 1000 * 60 * 10, // 10 minutes - featured list changes rarely
    retry: 2,
    enabled,
    initialData: initialData?.mentors,
  });

  // Featured sessions
  const featuredSessionsQuery = useQuery<MentorSessionPublic[], Error>({
    queryKey: ['featuredSessions'],
    queryFn: () => toNativePromise(
      PublicService.getFeaturedSessionsApiV1PublicFeaturedSessionsGet()
    ),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled,
    initialData: initialData?.sessions,
  });

  // Featured services
  const featuredServicesQuery = useQuery<MentorServicePublic[], Error>({
    queryKey: ['featuredServices'],
    queryFn: () => toNativePromise(
      PublicService.getFeaturedServicesApiV1PublicFeaturedServicesGet()
    ),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled,
    initialData: initialData?.services,
  });

  return {
    // Featured mentors
    featuredMentors: featuredMentorsQuery.data,
    isLoadingFeaturedMentors: featuredMentorsQuery.isLoading,
    isFeaturedError: featuredMentorsQuery.isError,
    featuredError: featuredMentorsQuery.error,
    refetchFeatured: featuredMentorsQuery.refetch,

    // Featured sessions
    featuredSessions: featuredSessionsQuery.data,
    isLoadingFeaturedSessions: featuredSessionsQuery.isLoading,
    isFeaturedSessionsError: featuredSessionsQuery.isError,
    featuredSessionsError: featuredSessionsQuery.error,
    refetchFeaturedSessions: featuredSessionsQuery.refetch,

    // Featured services
    featuredServices: featuredServicesQuery.data,
    isLoadingFeaturedServices: featuredServicesQuery.isLoading,
    isFeaturedServicesError: featuredServicesQuery.isError,
    featuredServicesError: featuredServicesQuery.error,
    refetchFeaturedServices: featuredServicesQuery.refetch,

    // Combined loading state (only if no initial data)
    isLoading: !initialData && (
      featuredMentorsQuery.isLoading ||
      featuredSessionsQuery.isLoading ||
      featuredServicesQuery.isLoading
    ),
  };
};


/**
 * Hook for fetching a specific mentor's sessions (public)
 * Uses MentorsService for public access to mentor sessions
 */
export const usePublicMentorSessions = (mentorId: number, enabled = true) => {
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorSessionPublic[], Error>({
    queryKey: ['publicMentorSessions', mentorId],
    queryFn: () => toNativePromise(
      MentorsService.getMentorSessionsApiV1MentorsMentorIdSessionsGet({ mentorId })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: enabled && !!mentorId,
  });

  return {
    sessions,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a specific mentor's services (public)
 * Uses MentorsService for public access to mentor services
 */
export const usePublicMentorServices = (mentorId: number, enabled = true) => {
  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorServicePublic[], Error>({
    queryKey: ['publicMentorServices', mentorId],
    queryFn: () => toNativePromise(
      MentorsService.getMentorServicesApiV1MentorsMentorIdServicesGet({ mentorId })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: enabled && !!mentorId,
  });

  return {
    services,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a specific session by UUID (public)
 * Uses MentorsService for public access to session details
 */
export const usePublicSessionByUuid = (
  sessionUuid: string,
  enabled: boolean = true
) => {
  return useQuery<MentorSessionPublic, Error>({
    queryKey: ['publicSession', sessionUuid],
    queryFn: () => toNativePromise(
      MentorsService.getSessionApiV1MentorsSessionsSessionUuidGet({ sessionUuid })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: enabled && !!sessionUuid,
  });
};
