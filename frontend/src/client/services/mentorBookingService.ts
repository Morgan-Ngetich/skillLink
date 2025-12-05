import type {
  BookingPublic,
  BookingCreateRequest,
  BookingsStatusUpdate,
  BookingStatusType,
} from "../models";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import type { CancelablePromise } from "../core/CancelablePromise";

/**
 * MentorBookingService
 * Handles session booking operations for mentors and mentees.
 * 
 * Flow:
 * 1. Mentee books session -> PENDING or CONFIRMED (based on mentor settings)
 * 2. Mentor confirms/denies -> CONFIRMED or CANCELLED_BY_MENTOR
 * 3. Session happens -> COMPLETED
 * 4. Either party can cancel -> CANCELLED_BY_MENTEE or CANCELLED_BY_MENTOR
 */
export class MentorBookingService {
  /**
   * Book a mentor session as a mentee
   * 
   * Creates a booking that is either:
   * - CONFIRMED immediately (if mentor has auto_accept_bookings enabled)
   * - PENDING (if mentor requires manual approval)
   * 
   * @param sessionId - Session ID to book
   * @param data - Booking request data (optional message from mentee)
   * @returns BookingPublic - Created booking
   * @throws ApiError if session is full, inactive, or other validation fails
   */
  public static bookSession(
    sessionId: number,
    data?: BookingCreateRequest
  ): CancelablePromise<BookingPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/profile/mentor/sessions/${sessionId}/book`,
      body: data,
      mediaType: "application/json",
      errors: {
        400: "Invalid booking request",
        403: "Cannot book own session",
        404: "Session not found",
        409: "Session is full or no longer available",
      },
    });
  }

  /**
   * Update booking status
   * 
   * Allowed transitions:
   * - PENDING -> CONFIRMED (mentor only)
   * - PENDING -> CANCELLED_BY_MENTOR (mentor only)
   * - PENDING -> CANCELLED_BY_MENTEE (mentee only)
   * - CONFIRMED -> COMPLETED (mentor only)
   * - CONFIRMED -> CANCELLED_BY_MENTOR (mentor only)
   * - CONFIRMED -> CANCELLED_BY_MENTEE (mentee only)
   * - CONFIRMED -> NO_SHOW_MENTEE/NO_SHOW_MENTOR (mentor only)
   * 
   * @param bookingId - Booking ID to update
   * @param data - New status data
   * @returns BookingPublic - Updated booking
   * @throws ApiError if transition is invalid or user lacks permission
   */
  public static updateBookingStatus(
    bookingId: number,
    data: BookingsStatusUpdate
  ): CancelablePromise<BookingPublic> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/api/v1/profile/mentor/bookings/${bookingId}/status`,
      body: data,
      mediaType: "application/json",
      errors: {
        400: "Invalid status transition",
        403: "Not authorized to update this booking",
        404: "Booking not found",
      },
    });
  }

  /**
   * Confirm a pending booking (mentor only)
   * 
   * Shortcut endpoint for mentors to quickly confirm bookings
   * Transitions: PENDING -> CONFIRMED
   * 
   * @param bookingId - Booking ID to confirm
   * @returns BookingPublic - Confirmed booking
   * @throws ApiError if not mentor or booking not in PENDING state
   */
  public static confirmBooking(
    bookingId: number
  ): CancelablePromise<BookingPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/profile/mentor/bookings/${bookingId}/confirm`,
      errors: {
        400: "Booking is not in pending state",
        403: "Only mentor can confirm bookings",
        404: "Booking not found",
      },
    });
  }

  /**
   * Deny a pending booking (mentor only)
   * 
   * Mentor rejects a booking request
   * Transitions: PENDING -> CANCELLED_BY_MENTOR
   * 
   * Note: We don't require a reason here, but you may prompt for a review later
   * 
   * @param bookingId - Booking ID to deny
   * @returns BookingPublic - Denied booking
   * @throws ApiError if not mentor or booking not in PENDING state
   */
  public static denyBooking(
    bookingId: number
  ): CancelablePromise<BookingPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/profile/mentor/bookings/${bookingId}/deny`,
      errors: {
        400: "Booking is not in pending state",
        403: "Only mentor can deny bookings",
        404: "Booking not found",
      },
    });
  }

  /**
   * Get all bookings for current user 
   * @param status - Optional filter by booking status
   * @returns BookingPublic[] - List of bookings
   * @throws ApiError
   */
  public static getMyBookings(
    status?: BookingStatusType
  ): CancelablePromise<BookingPublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/bookings",
      query: status ? { status } : undefined,
    });
  }

  /**
   * Get booking history including cancelled/completed bookings
   * 
   * Useful for showing users their past activity
   * 
   * @param includeCancelled - Whether to include cancelled bookings (default: true)
   * @returns BookingPublic[] - List of bookings
   * @throws ApiError
   */
  public static getBookingHistory(
    includeCancelled: boolean = true
  ): CancelablePromise<BookingPublic[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/profile/mentor/bookings/history",
      query: { include_cancelled: includeCancelled },
    });
  }

  /**
   * Get booking details by ID
   * 
   * @param bookingId - Booking ID to retrieve
   * @returns BookingPublic - Booking details
   * @throws ApiError if booking not found or user not authorized
   */
  public static getBookingById(
    bookingId: number
  ): CancelablePromise<BookingPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/profile/mentor/bookings/${bookingId}`,
      errors: {
        403: "Not authorized to view this booking",
        404: "Booking not found",
      },
    });
  }

  /**
   * Delete a booking
   * 
   * Permanently removes a booking from the database
   * Permission checks:
   * - Mentees can delete their own bookings
   * - Mentors can delete bookings for their sessions
   * 
   * Note: Consider using status updates (CANCELLED) instead of deletion
   * to maintain audit trail and booking history
   * 
   * @param bookingId - Booking ID to delete
   * @returns void
   * @throws ApiError if not authorized
   */
  public static deleteBooking(bookingId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/profile/mentor/bookings/${bookingId}`,
      errors: {
        403: "Not authorized to delete this booking",
        404: "Booking not found",
      },
    });
  }
}