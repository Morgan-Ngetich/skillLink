/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingCreateRequest } from '../models/BookingCreateRequest';
import type { BookingPublic } from '../models/BookingPublic';
import type { BookingStatus } from '../models/BookingStatus';
import type { BookingStatusUpdate } from '../models/BookingStatusUpdate';
import type { MentorProfileCreate } from '../models/MentorProfileCreate';
import type { MentorProfilePublic } from '../models/MentorProfilePublic';
import type { MentorProfileUpdate } from '../models/MentorProfileUpdate';
import type { MentorServiceCreate } from '../models/MentorServiceCreate';
import type { MentorServicePublic } from '../models/MentorServicePublic';
import type { MentorServiceUpdate } from '../models/MentorServiceUpdate';
import type { MentorSessionCreate } from '../models/MentorSessionCreate';
import type { MentorSessionPublic } from '../models/MentorSessionPublic';
import type { MentorSessionUpdate } from '../models/MentorSessionUpdate';
import type { MentorSettingsPublic } from '../models/MentorSettingsPublic';
import type { MentorSettingsUpdate } from '../models/MentorSettingsUpdate';
import type { MentorStatsPublic } from '../models/MentorStatsPublic';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MentorsService {
    /**
     * Get My Mentor Profile
     * Get current user's mentor profile
     * @returns MentorProfilePublic Successful Response
     * @throws ApiError
     */
    public static getMyMentorProfileApiV1MentorsProfileGet(): CancelablePromise<MentorProfilePublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/profile',
        });
    }
    /**
     * Create Mentor Profile
     * Create mentor profile (one-step onboarding)
     * @returns MentorProfilePublic Successful Response
     * @throws ApiError
     */
    public static createMentorProfileApiV1MentorsProfilePost({
        requestBody,
    }: {
        requestBody: MentorProfileCreate,
    }): CancelablePromise<MentorProfilePublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/profile',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update My Mentor Profile
     * Update current user's mentor profile
     * @returns MentorProfilePublic Successful Response
     * @throws ApiError
     */
    public static updateMyMentorProfileApiV1MentorsProfilePatch({
        requestBody,
    }: {
        requestBody: MentorProfileUpdate,
    }): CancelablePromise<MentorProfilePublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/mentors/profile',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Toggle Availability
     * Toggle mentor availability (open to mentees on/off)
     * @returns MentorProfilePublic Successful Response
     * @throws ApiError
     */
    public static toggleAvailabilityApiV1MentorsToggleAvailabilityPost(): CancelablePromise<MentorProfilePublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/toggle-availability',
        });
    }
    /**
     * Get Stats
     * Get comprehensive mentor statistics
     * @returns MentorStatsPublic Successful Response
     * @throws ApiError
     */
    public static getStatsApiV1MentorsStatsGet(): CancelablePromise<MentorStatsPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/stats',
        });
    }
    /**
     * Refresh Stats
     * Manually refresh cached stats
     * @returns any Successful Response
     * @throws ApiError
     */
    public static refreshStatsApiV1MentorsStatsRefreshPost(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/stats/refresh',
        });
    }
    /**
     * Get My Settings
     * Get current mentor's settings
     * @returns MentorSettingsPublic Successful Response
     * @throws ApiError
     */
    public static getMySettingsApiV1MentorsSettingsGet(): CancelablePromise<MentorSettingsPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/settings',
        });
    }
    /**
     * Update My Settings
     * Update current mentor's settings
     * @returns MentorSettingsPublic Successful Response
     * @throws ApiError
     */
    public static updateMySettingsApiV1MentorsSettingsPatch({
        requestBody,
    }: {
        requestBody: MentorSettingsUpdate,
    }): CancelablePromise<MentorSettingsPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/mentors/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List My Services
     * List current mentor's services
     * @returns MentorServicePublic Successful Response
     * @throws ApiError
     */
    public static listMyServicesApiV1MentorsServicesGet(): CancelablePromise<Array<MentorServicePublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/services',
        });
    }
    /**
     * Create Service
     * Create new service offering
     * @returns MentorServicePublic Successful Response
     * @throws ApiError
     */
    public static createServiceApiV1MentorsServicesPost({
        requestBody,
    }: {
        requestBody: MentorServiceCreate,
    }): CancelablePromise<MentorServicePublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/services',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Service
     * Update service
     * @returns MentorServicePublic Successful Response
     * @throws ApiError
     */
    public static updateServiceApiV1MentorsServicesServiceIdPatch({
        serviceId,
        requestBody,
    }: {
        serviceId: number,
        requestBody: MentorServiceUpdate,
    }): CancelablePromise<MentorServicePublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/mentors/services/{service_id}',
            path: {
                'service_id': serviceId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Service
     * Delete service
     * @returns void
     * @throws ApiError
     */
    public static deleteServiceApiV1MentorsServicesServiceIdDelete({
        serviceId,
    }: {
        serviceId: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/mentors/services/{service_id}',
            path: {
                'service_id': serviceId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Mentor Services
     * Get mentor's services (public)
     * @returns MentorServicePublic Successful Response
     * @throws ApiError
     */
    public static getMentorServicesApiV1MentorsMentorIdServicesGet({
        mentorId,
    }: {
        mentorId: number,
    }): CancelablePromise<Array<MentorServicePublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/{mentor_id}/services',
            path: {
                'mentor_id': mentorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Book Session
     * Book a mentor session
     * @returns BookingPublic Successful Response
     * @throws ApiError
     */
    public static bookSessionApiV1MentorsSessionsSessionIdBookPost({
        sessionId,
        requestBody,
    }: {
        sessionId: number,
        requestBody: BookingCreateRequest,
    }): CancelablePromise<BookingPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/sessions/{session_id}/book',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List My Bookings
     * List current user's bookings
     * @returns BookingPublic Successful Response
     * @throws ApiError
     */
    public static listMyBookingsApiV1MentorsBookingsGet({
        status,
    }: {
        status?: (BookingStatus | null),
    }): CancelablePromise<Array<BookingPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/bookings',
            query: {
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Booking History
     * Get booking history including cancelled/completed
     * @returns BookingPublic Successful Response
     * @throws ApiError
     */
    public static getBookingHistoryApiV1MentorsBookingsHistoryGet({
        includeCancelled = true,
    }: {
        includeCancelled?: boolean,
    }): CancelablePromise<Array<BookingPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/bookings/history',
            query: {
                'include_cancelled': includeCancelled,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Booking Status
     * Update booking status
     * @returns BookingPublic Successful Response
     * @throws ApiError
     */
    public static updateBookingStatusApiV1MentorsBookingsBookingIdStatusPatch({
        bookingId,
        requestBody,
    }: {
        bookingId: number,
        requestBody: BookingStatusUpdate,
    }): CancelablePromise<BookingPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/mentors/bookings/{booking_id}/status',
            path: {
                'booking_id': bookingId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Confirm Booking
     * Confirm pending booking (mentor only)
     * @returns BookingPublic Successful Response
     * @throws ApiError
     */
    public static confirmBookingApiV1MentorsBookingsBookingIdConfirmPost({
        bookingId,
    }: {
        bookingId: number,
    }): CancelablePromise<BookingPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/bookings/{booking_id}/confirm',
            path: {
                'booking_id': bookingId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Deny Booking
     * Deny pending booking with reason (mentor only)
     * @returns BookingPublic Successful Response
     * @throws ApiError
     */
    public static denyBookingApiV1MentorsBookingsBookingIdDenyPost({
        bookingId,
        reason,
    }: {
        bookingId: number,
        reason: string,
    }): CancelablePromise<BookingPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/bookings/{booking_id}/deny',
            path: {
                'booking_id': bookingId,
            },
            query: {
                'reason': reason,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Booking
     * Delete booking
     * @returns void
     * @throws ApiError
     */
    public static deleteBookingApiV1MentorsBookingsBookingIdDelete({
        bookingId,
    }: {
        bookingId: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/mentors/bookings/{booking_id}',
            path: {
                'booking_id': bookingId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Session
     * Create new mentor session
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static createSessionApiV1MentorsSessionsPost({
        requestBody,
    }: {
        requestBody: MentorSessionCreate,
    }): CancelablePromise<MentorSessionPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/mentors/sessions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Sessions
     * List sessions visible to current user
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static listSessionsApiV1MentorsSessionsGet({
        currentUser,
        skip,
        limit = 100,
    }: {
        currentUser?: (User | null),
        skip?: number,
        limit?: number,
    }): CancelablePromise<Array<MentorSessionPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/sessions',
            query: {
                'current_user': currentUser,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Session
     * Get session by UUID with privacy checks
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static getSessionApiV1MentorsSessionsSessionUuidGet({
        sessionUuid,
        currentUser,
    }: {
        sessionUuid: string,
        currentUser?: (User | null),
    }): CancelablePromise<MentorSessionPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/sessions/{session_uuid}',
            path: {
                'session_uuid': sessionUuid,
            },
            query: {
                'current_user': currentUser,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Session
     * Update mentor session
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static updateSessionApiV1MentorsSessionsSessionIdPatch({
        sessionId,
        requestBody,
    }: {
        sessionId: number,
        requestBody: MentorSessionUpdate,
    }): CancelablePromise<MentorSessionPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/mentors/sessions/{session_id}',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cancel Session
     * Cancel session (soft delete)
     * @returns void
     * @throws ApiError
     */
    public static cancelSessionApiV1MentorsSessionsSessionIdDelete({
        sessionId,
    }: {
        sessionId: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/mentors/sessions/{session_id}',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Toggle Session Visibility
     * Toggle session public/private visibility
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static toggleSessionVisibilityApiV1MentorsSessionsSessionIdTogglePublicPatch({
        sessionId,
    }: {
        sessionId: number,
    }): CancelablePromise<MentorSessionPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/mentors/sessions/{session_id}/toggle-public',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Mentor Sessions
     * Get all sessions for a specific mentor
     * @returns MentorSessionPublic Successful Response
     * @throws ApiError
     */
    public static getMentorSessionsApiV1MentorsMentorIdSessionsGet({
        mentorId,
        currentUser,
    }: {
        mentorId: number,
        currentUser?: (User | null),
    }): CancelablePromise<Array<MentorSessionPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/mentors/{mentor_id}/sessions',
            path: {
                'mentor_id': mentorId,
            },
            query: {
                'current_user': currentUser,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
