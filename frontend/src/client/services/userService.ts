import type {
  UserPublic,
  UsersPublic,
  UserSyncIn,
  UserUpdate,
  UserCreate
} from '../models';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { CancelablePromise } from '../core/CancelablePromise';

export class UserService {
  /**
   * Get Current Authenticated User
   * Returns the current user's public data (id, email, full_name, roles, etc).
   * @returns UserPublic - The authenticated user's public information
   * @throws ApiError
   */
  public static getCurrentUser(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/me',
    });
  }

  /**
   * Sync User from Supabase
   * Triggers creation or update of a user in the database using Supabase data.
   * @param user - Supabase user data (UUID, email, full name, avatar)
   * @returns UserPublic - The synced user's public profile
   * @throws ApiError
   */
  public static syncUserFromSupabase(user: UserSyncIn): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/users/sync',
      body: user,
      mediaType: 'application/json',
    });
  }

  /**
   * Get All Users
   * Fetches a paginated list of users.
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Maximum number of users to return
   * @returns UsersPublic - List of user profiles and total count
   * @throws ApiError
   */
  public static getUsers(skip: number = 0, limit: number = 100): CancelablePromise<UsersPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/',
      query: { skip, limit },
    });
  }

  /**
   * Create a New User
   * Admin-only endpoint to create a new user manually.
   * @param user - Full user info (name, email, password, is_active)
   * @returns UserPublic - Newly created user profile
   * @throws ApiError
   */
  public static createUser(user: UserCreate): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/users/',
      body: user,
      mediaType: 'application/json',
    });
  }

  /**
   * Get User by ID
   * Fetches public data for a specific user by numeric ID.
   * @param userId - Numeric ID of the user
   * @returns UserPublic - Public profile of the specified user
   * @throws ApiError
   */
  public static getUserById(userId: number): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/users/${userId}`,
    });
  }

  /**
   * Update User by ID (Admin Only)
   * Allows admin to update a user's details by their ID.
   * @param userId - Numeric ID of the user
   * @param data - Partial update payload (name, email, avatar, etc)
   * @returns UserPublic - Updated public user profile
   * @throws ApiError
   */
  public static updateUserById(userId: number, data: UserUpdate): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      body: data,
      mediaType: 'application/json',
    });
  }

  /**
   * Update Current Authenticated User
   * Allows the logged-in user to update their own profile.
   * @param data - Partial update payload (name, email, avatar, etc)
   * @returns UserPublic - Updated public profile of the current user
   * @throws ApiError
   */
  public static updateMe(data: UserUpdate): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/users/me',
      body: data,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete a User
   * Permanently deletes a user by their ID (admin-only).
   * @param userId - Numeric ID of the user
   * @returns string - Confirmation message or status
   * @throws ApiError
   */
  public static deleteUser(userId: number): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/api/v1/users/users/${userId}`,
    });
  }
}
