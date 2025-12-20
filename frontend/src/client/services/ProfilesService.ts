/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserProfileCreate } from '../models/UserProfileCreate';
import type { UserProfilePublic } from '../models/UserProfilePublic';
import type { UserProfileUpdate } from '../models/UserProfileUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfilesService {
    /**
     * Get My Profile
     * Get current user's profile
     * @returns UserProfilePublic Successful Response
     * @throws ApiError
     */
    public static getMyProfileApiV1ProfilesMeGet(): CancelablePromise<UserProfilePublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/profiles/me',
        });
    }
    /**
     * Create Profile
     * Create user profile and assign MENTEE role
     * @returns UserProfilePublic Successful Response
     * @throws ApiError
     */
    public static createProfileApiV1ProfilesPost({
        requestBody,
    }: {
        requestBody: UserProfileCreate,
    }): CancelablePromise<UserProfilePublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/profiles/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update My Profile
     * Update current user's profile
     * @returns UserProfilePublic Successful Response
     * @throws ApiError
     */
    public static updateMyProfileApiV1ProfilesPatch({
        requestBody,
    }: {
        requestBody: UserProfileUpdate,
    }): CancelablePromise<UserProfilePublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/profiles/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Completion Status
     * Get detailed profile completion status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCompletionStatusApiV1ProfilesCompletionStatusGet(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/profiles/completion-status',
        });
    }
    /**
     * Get User Profile
     * Get user profile by ID (public)
     * @returns UserProfilePublic Successful Response
     * @throws ApiError
     */
    public static getUserProfileApiV1ProfilesUserIdGet({
        userId,
    }: {
        userId: number,
    }): CancelablePromise<UserProfilePublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/profiles/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User Profile
     * Update user profile by ID (admin only)
     * @returns UserProfilePublic Successful Response
     * @throws ApiError
     */
    public static updateUserProfileApiV1ProfilesUserIdPatch({
        userId,
        requestBody,
    }: {
        userId: number,
        requestBody: UserProfileUpdate,
    }): CancelablePromise<UserProfilePublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/profiles/{user_id}',
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
}
