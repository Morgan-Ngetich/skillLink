import type {
  MentorProfilePublic,
  MentorSessionPublic,
  MentorServicePublic,
  UserPublic,
} from "../models";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import type { CancelablePromise } from "../core/CancelablePromise";

/**
 * PublicMentorService
 * Handles public mentor discovery and exploration operations.
 * No authentication required for these endpoints.
 */
export class PublicMentorService {
  /**
   * List all mentors with optional filters
   * @param expertise - Filter by area of expertise
   * @param available - Filter by availability status
   * @param limit - Number of mentors per page (1-100, default: 20)
   * @param offset - Pagination offset (default: 0)
   * @returns MentorProfilePublic[] - List of mentor profiles
   * @throws ApiError
   */
  public static listMentors(
    expertise?: string,
    available?: boolean,
    limit: number = 20,
    offset: number = 0
  ): CancelablePromise<UserPublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/mentors",
      query: {
        expertise,
        available,
        limit,
        offset,
      },
    });
  }

  /**
   * Get featured mentors (first 20 to sign up)
   * @returns MentorProfilePublic[] - List of featured mentor profiles
   * @throws ApiError
   */
  public static getFeaturedMentors(): CancelablePromise<UserPublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/mentors/featured",
    });
  }

  /**
   * Get featured sessions (first 20 active sessions created)
   * @returns MentorSessionPublic[] - List of featured sessions
   * @throws ApiError
   */
  public static getFeaturedSessions(): CancelablePromise<MentorSessionPublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/sessions/featured",
    });
  }

  /**
   * Get featured services (first 20 active services created)
   * @returns MentorServicePublic[] - List of featured services
   * @throws ApiError
   */
  public static getFeaturedServices(): CancelablePromise<MentorServicePublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/services/featured",
    });
  }

  /**
   * Get a specific mentor's profile by user ID
   * @param userId - User ID of the mentor
   * @returns MentorProfilePublic - Mentor profile details
   * @throws ApiError
   */
  public static getMentorProfile(
    userId: number
  ): CancelablePromise<MentorProfilePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/profile/mentor/${userId}/profile`,
    });
  }

  /**
 * Get a specific mentor's profile by UUID
 * @param uuid - Public UUID of the mentor
 * @returns MentorProfilePublic - Mentor profile details
 * @throws ApiError
 */
  public static getMentorProfileByUuid(
    uuid: string
  ): CancelablePromise<MentorProfilePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/profile/mentor/${uuid}/profile`,
    });
  }


  /**
   * Get all active sessions for a specific mentor
   * @param userId - User ID of the mentor
   * @returns MentorSessionPublic[] - List of mentor's active sessions
   * @throws ApiError
   */
  public static getMentorSessions(
    userId: number
  ): CancelablePromise<MentorSessionPublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/profile/mentor/${userId}/sessions`,
    });
  }

  /**
   * Get all active services for a specific mentor
   * @param userId - User ID of the mentor
   * @returns MentorServicePublic[] - List of mentor's active services
   * @throws ApiError
   */
  public static getMentorServices(
    userId: number
  ): CancelablePromise<MentorServicePublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/profile/mentor/${userId}/services`,
    });
  }
}