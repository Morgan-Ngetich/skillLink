import type {
  MentorSessionCreate,
  MentorSessionPublic,
  MentorSessionUpdate,
  MentorServiceCreate,
  MentorServicePublic,
  MentorServiceUpdate,
  MentorSettingsCreate,
  MentorSettingsPublic,
  MentorSettingsUpdate,
} from '../models';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { CancelablePromise } from '../core/CancelablePromise';

/**
 * MentorSessionService
 * Handles CRUD operations for mentor sessions (like 1-on-1 calls, mock interviews, etc.)
 */
export class MentorSessionService {
  /**
   * Get All Mentor Sessions (for current user)
   * Returns a list of all sessions created by the authenticated mentor.
   * @returns MentorSessionPublic[] - List of mentor sessions
   * @throws ApiError
   */
  public static getMySessions(): CancelablePromise<MentorSessionPublic[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/profile/mentor/sessions',
    });
  }

  /**
 * Create a New Mentor Session
 * @param session - Session data (title, duration, price_usd, etc.)
 * @returns MentorSessionPublic - Created session
 * @throws ApiError
 */
  public static createSession(
    session: MentorSessionCreate
  ): CancelablePromise<MentorSessionPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/profile/mentor/sessions',
      body: session,
      mediaType: 'application/json',
    });
  }

  /**
 * Update an Existing Mentor Session
 * @param sessionId - Numeric ID of the session
 * @param updates - Partial data to update
 * @returns MentorSessionPublic - Updated session
 * @throws ApiError
 */
  public static updateSession(
    sessionId: number,
    updates: MentorSessionUpdate
  ): CancelablePromise<MentorSessionPublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: `/api/v1/profile/mentor/sessions/${sessionId}`,
      body: updates,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete a Mentor Session
   * @param sessionId - Numeric ID of the session
   * @returns void
   * @throws ApiError
   */
  public static deleteSession(sessionId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/api/v1/profile/mentor/sessions/${sessionId}`,
    });
  }


  /**
   * Get a Specific Mentor Session by ID
   * @param sessionId - Numeric ID of the session
   * @returns MentorSessionPublic - Session details
   * @throws ApiError
   */
  public static getSessionById(
    sessionId: number
  ): CancelablePromise<MentorSessionPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/profile/mentor/sessions/${sessionId}`,
    });
  }

}

/**
 * MentorServiceService
 * Handles CRUD operations for mentor services (like resume review, portfolio feedback, etc.)
 */
export class MentorServiceService {
  /**
   * Get All Mentor Services (for current user)
   * Returns a list of all services offered by the authenticated mentor.
   * @returns MentorServicePublic[] - List of mentor services
   * @throws ApiError
   */
  public static getMyServices(): CancelablePromise<MentorServicePublic[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/profile/mentor/services',
    });
  }

  /**
   * Get a Specific Mentor Service by ID
   * @param serviceId - Numeric ID of the service
   * @returns MentorServicePublic - Service details
   * @throws ApiError
   */
  public static getServiceById(
    serviceId: number
  ): CancelablePromise<MentorServicePublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/profile/mentor/services/${serviceId}`,
    });
  }

  /**
   * Create a New Mentor Service
   * @param service - Service data (title, description, price, etc.)
   * @returns MentorServicePublic - Created service
   * @throws ApiError
   */
  public static createService(
    service: MentorServiceCreate
  ): CancelablePromise<MentorServicePublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/profile/mentor/services',
      body: service,
      mediaType: 'application/json',
    });
  }

  /**
   * Update an Existing Mentor Service
   * @param serviceId - Numeric ID of the service
   * @param updates - Partial data to update
   * @returns MentorServicePublic - Updated service
   * @throws ApiError
   */
  public static updateService(
    serviceId: number,
    updates: MentorServiceUpdate
  ): CancelablePromise<MentorServicePublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: `/api/v1/profile/mentor/services/${serviceId}`,
      body: updates,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete a Mentor Service
   * @param serviceId - Numeric ID of the service
   * @returns void
   * @throws ApiError
   */
  public static deleteService(serviceId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/api/v1/profile/mentor/services/${serviceId}`,
    });
  }
}

/**
 * MentorSettingsService
 * Handles mentor-specific settings like schedule, availability, booking rules, etc.
 */
export class MentorSettingsService {
  /**
   * Get Current Mentor Settings
   * Returns the current authenticated mentor's settings.
   * @returns MentorSettingsPublic - Current mentor settings
   * @throws ApiError
   */
  public static getMySettings(): CancelablePromise<MentorSettingsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/profile/mentor/settings',
    });
  }

  /**
 * Update Mentor Settings
 * Updates existing mentor settings (partial updates allowed).
 * @param updates - Partial data to update
 * @returns MentorSettingsPublic - Updated mentor settings
 * @throws ApiError
 */
  public static updateSettings(
    updates: MentorSettingsUpdate
  ): CancelablePromise<MentorSettingsPublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/profile/mentor/settings',
      body: updates,
      mediaType: 'application/json',
    });
  }

  /**
   * Create Mentor Settings
   * Used to initialize mentor settings during onboarding.
   * @param settings - Mentor settings data (availability, timezone, preferences, etc.)
   * @returns MentorSettingsPublic - Created mentor settings
   * @throws ApiError
   */
  public static createSettings(
    settings: MentorSettingsCreate
  ): CancelablePromise<MentorSettingsPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/profile/mentor/settings',
      body: settings,
      mediaType: 'application/json',
    });
  }

  /**
   * Reset Weekly Schedule
   * Resets mentor’s weekly schedule to defaults.
   * @returns MentorSettingsPublic - Updated settings with default schedule
   * @throws ApiError
   */
  public static resetWeeklySchedule(): CancelablePromise<MentorSettingsPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/profile/mentor/settings/reset-schedule',
    });
  }
}
