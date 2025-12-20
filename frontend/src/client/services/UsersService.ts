/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCreate } from '../models/UserCreate';
import type { UserPublic } from '../models/UserPublic';
import type { UsersPublic } from '../models/UsersPublic';
import type { UserSyncIn } from '../models/UserSyncIn';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get Me
     * Get current authenticated user
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static getMeApiV1UsersMeGet(): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
        });
    }
    /**
     * Update Me
     * Update current user's information
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateMeApiV1UsersMePatch({
        requestBody,
    }: {
        requestBody: UserUpdate,
    }): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Sync User
     * Sync user from Supabase to local database
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static syncUserApiV1UsersSyncPost({
        requestBody,
    }: {
        requestBody: UserSyncIn,
    }): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/sync',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Users
     * List all users (admin only)
     * @returns UsersPublic Successful Response
     * @throws ApiError
     */
    public static listUsersApiV1UsersGet({
        skip,
        limit = 100,
    }: {
        skip?: number,
        limit?: number,
    }): CancelablePromise<UsersPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create User
     * Create new user (admin only)
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static createUserApiV1UsersPost({
        requestBody,
    }: {
        requestBody: UserCreate,
    }): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User
     * Get user by ID or UUID (public endpoint)
     *
     * Examples:
     * - GET /users/123           # By user ID
     * - GET /users/550e8400-...  # By UUID
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static getUserApiV1UsersIdentifierGet({
        identifier,
    }: {
        identifier: string,
    }): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{identifier}',
            path: {
                'identifier': identifier,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * Update user by ID (admin only)
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateUserApiV1UsersUserIdPatch({
        userId,
        requestBody,
    }: {
        userId: number,
        requestBody: UserUpdate,
    }): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * Delete user (admin only)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteUserApiV1UsersUserIdDelete({
        userId,
    }: {
        userId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
