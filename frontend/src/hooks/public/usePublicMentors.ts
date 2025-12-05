import { useQuery } from '@tanstack/react-query';
import {
  PublicMentorService,
  type MentorProfilePublic,
  type MentorSessionPublic,
  type MentorServicePublic,
  type UserPublic,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';

interface UseMentorsParams {
  expertise?: string;
  available?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook for public mentor discovery and exploration
 */
export const usePublicMentors = (params?: UseMentorsParams) => {
  const {
    expertise,
    available,
    limit = 20,
    offset = 0,
    enabled = true,
  } = params || {};

  // List all mentors with filters
  const {
    data: mentors,
    isLoading: isLoadingMentors,
    isError: isMentorsError,
    error: mentorsError,
    refetch: refetchMentors,
  } = useQuery<UserPublic[], Error>({
    queryKey: ['publicMentors', expertise, available, limit, offset],
    queryFn: () =>
      toNativePromise(
        PublicMentorService.listMentors(expertise, available, limit, offset)
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes - public data doesn't change often
    retry: 2,
    enabled,
  });

  // Featured mentors (homepage)
  const {
    data: featuredMentors,
    isLoading: isLoadingFeaturedMentors,
    isError: isFeaturedError,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery<UserPublic[], Error>({
    queryKey: ['featuredMentors'],
    queryFn: () => toNativePromise(PublicMentorService.getFeaturedMentors()),
    staleTime: 1000 * 60 * 10, // 10 minutes - featured list changes rarely
    retry: 2,
    enabled,
  });

  // Featured sessions
  const {
    data: featuredSessions,
    isLoading: isLoadingFeaturedSessions,
    isError: isFeaturedSessionsError,
    error: featuredSessionsError,
    refetch: refetchFeaturedSessions,
  } = useQuery<MentorSessionPublic[], Error>({
    queryKey: ['featuredSessions'],
    queryFn: () => toNativePromise(PublicMentorService.getFeaturedSessions()),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled,
  });

  // Featured services
  const {
    data: featuredServices,
    isLoading: isLoadingFeaturedServices,
    isError: isFeaturedServicesError,
    error: featuredServicesError,
    refetch: refetchFeaturedServices,
  } = useQuery<MentorServicePublic[], Error>({
    queryKey: ['featuredServices'],
    queryFn: () => toNativePromise(PublicMentorService.getFeaturedServices()),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled,
  });

  return {
    // Mentor listing
    mentors,
    isLoadingMentors,
    isMentorsError,
    mentorsError,
    refetchMentors,

    // Featured mentors
    featuredMentors,
    isLoadingFeaturedMentors,
    isFeaturedError,
    featuredError,
    refetchFeatured,

    // Featured sessions
    featuredSessions,
    isLoadingFeaturedSessions,
    isFeaturedSessionsError,
    featuredSessionsError,
    refetchFeaturedSessions,

    // Featured services
    featuredServices,
    isLoadingFeaturedServices,
    isFeaturedServicesError,
    featuredServicesError,
    refetchFeaturedServices,

    // Combined loading state
    isLoading:
      isLoadingMentors ||
      isLoadingFeaturedMentors ||
      isLoadingFeaturedSessions ||
      isLoadingFeaturedServices,
  };
};

/**
 * Hook for fetching a specific mentor's details
 */
export const usePublicMentorProfile = (uuid: string, enabled = true) => {
  const {
    data: mentorProfile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorProfilePublic, Error>({
    queryKey: ['publicMentorProfile', uuid],
    queryFn: () => toNativePromise(PublicMentorService.getMentorProfileByUuid(uuid)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: enabled && !!uuid,
  });

  return {
    mentorProfile,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a specific mentor's sessions
 */
export const usePublicMentorSessions = (userId: number, enabled = true) => {
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorSessionPublic[], Error>({
    queryKey: ['publicMentorSessions', userId],
    queryFn: () => toNativePromise(PublicMentorService.getMentorSessions(userId)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: enabled && !!userId,
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
 * Hook for fetching a specific mentor's services
 */
export const usePublicMentorServices = (userId: number, enabled = true) => {
  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorServicePublic[], Error>({
    queryKey: ['publicMentorServices', userId],
    queryFn: () => toNativePromise(PublicMentorService.getMentorServices(userId)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: enabled && !!userId,
  });

  return {
    services,
    isLoading,
    isError,
    error,
    refetch,
  };
};
