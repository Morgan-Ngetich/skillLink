import type {
  UserPublic,
  UserSyncIn
} from '../models';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { CancelablePromise } from '../core/CancelablePromise';

export class UserService {
  /**
   * Get Current Authenticated User
   * Returns the current user's public data (id, email, full_name, role).
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static getCurrentUser(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/me',
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

  /**
   * Sync User from Supabase
   * Syncs a user from Supabase by creating or updating their record in the database.
   * @param user UserSyncIn
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static syncUserFromSupabase(user: UserSyncIn): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/users/sync',
      body: user,
      mediaType: 'application/json', // <-- fixed typo from "applciation/json"
    });
  }
}
