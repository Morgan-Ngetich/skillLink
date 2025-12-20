/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocationType } from '../models/LocationType';
import type { MentorExplorePublic } from '../models/MentorExplorePublic';
import type { MentorServicePublic } from '../models/MentorServicePublic';
import type { MentorSessionPublic } from '../models/MentorSessionPublic';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicService {
    /**
     * Browse Mentors
     * Browse mentors for explore page.
     * - Returns lightweight public info optimized for listing.
     * @returns MentorExplorePublic Successful Response
     * @throws ApiError
     */
    public static browseMentorsApiV1PublicMentorsGet({
        expertise,
        available,
        limit = 20,
        offset,
    }: {
        /**
         * Filter by expertise
         */
        expertise?: (string | null),
        /**
         * Only mentors open to mentees
         */
        available?: (boolean | null),
        limit?: number,
        offset?: number,
    }): CancelablePromise<Array<MentorExplorePublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/mentors',
            query: {
                'expertise': expertise,
                'available': available,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Browse Sessions
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static browseSessionsApiV1PublicSessionsGet({
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
        offset,
    }: {
        sessionType?: (string | null),
        locationType?: (LocationType | null),
        tag?: (string | null),
        mentorExpertise?: (string | null),
        minPrice?: (number | null),
        maxPrice?: (number | null),
        minDuration?: (number | null),
        maxDuration?: (number | null),
        fromTime?: (string | null),
        toTime?: (string | null),
        onlyAvailable?: boolean,
        limit?: number,
        offset?: number,
    }): CancelablePromise<Array<MentorSessionPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/sessions',
            query: {
                'session_type': sessionType,
                'location_type': locationType,
                'tag': tag,
                'mentor_expertise': mentorExpertise,
                'min_price': minPrice,
                'max_price': maxPrice,
                'min_duration': minDuration,
                'max_duration': maxDuration,
                'from_time': fromTime,
                'to_time': toTime,
                'only_available': onlyAvailable,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Browse Services
     * @returns MentorServicePublic Successful Response
     * @throws ApiError
     */
    public static browseServicesApiV1PublicServicesGet({
        category,
        minPrice,
        maxPrice,
        limit = 20,
        offset,
    }: {
        category?: (string | null),
        minPrice?: (number | null),
        maxPrice?: (number | null),
        limit?: number,
        offset?: number,
    }): CancelablePromise<Array<MentorServicePublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/services',
            query: {
                'category': category,
                'min_price': minPrice,
                'max_price': maxPrice,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Featured Mentors
     * Get featured mentors
     * @returns MentorExplorePublic Successful Response
     * @throws ApiError
     */
    public static getFeaturedMentorsApiV1PublicFeaturedMentorsGet(): CancelablePromise<Array<MentorExplorePublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/featured/mentors',
        });
    }
    /**
     * Get Featured Sessions
     * Get featured sessions
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static getFeaturedSessionsApiV1PublicFeaturedSessionsGet(): CancelablePromise<Array<MentorSessionPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/featured/sessions',
        });
    }
    /**
     * Get Featured Services
     * Get featured services
     * @returns MentorServicePublic Successful Response
     * @throws ApiError
     */
    public static getFeaturedServicesApiV1PublicFeaturedServicesGet(): CancelablePromise<Array<MentorServicePublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/featured/services',
        });
    }
}
