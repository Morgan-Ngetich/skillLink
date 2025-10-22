import type {
  UserProfilePublic,
  UserProfileCreate,
  UserProfileUpdate,
  MentorProfileCreate,
  MentorProfilePublic,
  MentorProfileUpdate,
  ProfileCompletionStatus,
  MentorStats,

} from '../models';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { CancelablePromise } from '../core/CancelablePromise';

export class ProfileService {
  // ========== USER PROFILE ==========

  /**
   * Get Current User Profile
   * Returns the authenticated user's profile details (about, goals, interests, etc).
   * @returns UserProfilePublic - Public profile of the current user
   * @throws ApiError
   */
  public static getMyProfile(): CancelablePromise<UserProfilePublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/profile/',
    });
  }

  /**
   * Get User Profile by ID
   * Returns the public profile of any user by their user ID (for admin or public viewing).
   * @param userId - Numeric ID of the user
   * @returns UserProfilePublic - Public profile of the specified user
   * @throws ApiError
   */
  public static getUserProfile(userId: number): CancelablePromise<UserProfilePublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/profile/${userId}`,
    });
  }

  /**
   * Create User Profile
   * Creates a new profile for the authenticated user and assigns the MENTEE role.
   * @param profile - User profile data (about, location, goals, etc)
   * @returns UserProfilePublic - Created public profile
   * @throws ApiError
   */
  public static createProfile(
    profile: UserProfileCreate
  ): CancelablePromise<UserProfilePublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/profile/',
      body: profile,
      mediaType: 'application/json',
    });
  }

  /**
   * Update User Profile
   * Updates the current user's profile (partial updates allowed).
   * @param profile - Partial profile data to update
   * @returns UserProfilePublic - Updated public profile
   * @throws ApiError
   */
  public static updateProfile(
    profile: UserProfileUpdate
  ): CancelablePromise<UserProfilePublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/profile/',
      body: profile,
      mediaType: 'application/json',
    });
  }


  /**
   * Get Profile Completion Status
   * Return detailed completion status with missing fields and their corresponding steps.
   * @returns ProfileCompletionStatus - Completion details
   * @throws ApiError
   */
  public static getProfileCompletionStatus(): CancelablePromise<ProfileCompletionStatus> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/completion-status"
    })
  }

  // ========== MENTOR PROFILE ==========

  /**
   * Get Current Mentor Profile
   * Returns the mentor profile for the current authenticated user.
   * @returns MentorProfilePublic - Public mentor profile of the current user
   * @throws ApiError
   */
  public static getMyMentorProfile(): CancelablePromise<MentorProfilePublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/profile/mentor',
    });
  }

  /**
   * Get Mentor Profile by User ID
   * Returns another user's mentor profile by their user ID (admin/public usage).
   * @param userId - Numeric ID of the user
   * @returns MentorProfilePublic - Public mentor profile of the specified user
   * @throws ApiError
   */
  public static getMentorProfileByUserId(userId: number): CancelablePromise<MentorProfilePublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/profile/mentor/${userId}`,
    });
  }

  /**
   * Create Mentor Profile
   * Creates a new mentor profile and assigns the MENTOR role.
   * @param profile - Mentor profile data (industries, expertise, availability, etc)
   * @returns MentorProfilePublic - Created mentor profile
   * @throws ApiError
   */
  public static createMentorProfile(
    profile: MentorProfileCreate
  ): CancelablePromise<MentorProfilePublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/profile/mentor',
      body: profile,
      mediaType: 'application/json',
    });
  }

  /**
   * Update Mentor Profile
   * Updates the current user's mentor profile (partial updates allowed).
   * @param profile - Partial mentor profile data to update
   * @returns MentorProfilePublic - Updated mentor profile
   * @throws ApiError
   */
  public static updateMentorProfile(
    profile: MentorProfileUpdate
  ): CancelablePromise<MentorProfilePublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/profile/mentor',
      body: profile,
      mediaType: 'application/json',
    });
  }


  /**
   * Get Mentor Stats
   * Returns statistics and analytics for the current mentor.
   * @returns MentorStats - Mentor statistics
   * @thows ApiError
   */
  public static getMentorStats(): CancelablePromise<MentorStats> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/stats"
    })
  }
}
