import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../../hooks/public/useToaster';
import {
  MentorsService,
  type BookingPublic,
  type BookingStatusUpdate,
  type BookingStatus,
  type BookingCreateRequest,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

interface BookingCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

/**
 * Hook for managing mentor session bookings
 * 
 * Provides:
 * - Fetching bookings (with status filtering)
 * - Creating bookings (mentee books a session)
 * - Updating booking status (confirm, cancel, complete, no-show)
 * - Helper functions for common actions
 * - Filtered booking lists (pending, confirmed, completed, cancelled)
 * 
 * @param statusFilter - Optional filter for initial bookings query
 */
export const useMentorBookings = (statusFilter?: BookingStatus) => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QUERIES

  /**
   * Fetch bookings with optional status filter
   */
  const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BookingPublic[], Error>({
    queryKey: ['mentorBookings', statusFilter],
    queryFn: () => toNativePromise(
      MentorsService.listMyBookingsApiV1MentorsBookingsGet({ status: statusFilter })
    ),
    staleTime: 1000 * 60 * 2, // 2 minutes - bookings change frequently
    retry: 1,
  });

  /**
   * Fetch booking history (includes cancelled/completed)
   */
  const {
    data: bookingHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery<BookingPublic[], Error>({
    queryKey: ['mentorBookings', 'history'],
    queryFn: () => toNativePromise(
      MentorsService.getBookingHistoryApiV1MentorsBookingsHistoryGet({ includeCancelled: true })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes - history changes less frequently
    enabled: false, // Only fetch when explicitly requested
  });

  const invalidateAllQueries = () => {
    // Invalidate bookings
    queryClient.invalidateQueries({ queryKey: ['mentorBookings'] });

    // Invalidate sessions (CRITICAL - this updates session.bookings)
    queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });

    // Invalidate stats
    queryClient.invalidateQueries({ queryKey: ['mentorStats'] });

    // Invalidate calendar data
    queryClient.invalidateQueries({ queryKey: ['mentorCalendar'] });

    // Invalidate users data
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
  };

  // MUTATIONS

  /**
   * Book a session (mentee action)
   * 
   * Flow:
   * 1. Mentee books session
   * 2. Status is PENDING (if manual approval) or CONFIRMED (if auto-accept)
   * 3. Invalidates relevant queries to refresh UI
   */
  const bookSession = useMutation<
    BookingPublic,
    Error,
    { sessionId: number; data: BookingCreateRequest }
  >({
    mutationFn: ({ sessionId, data }) =>
      toNativePromise(
        MentorsService.bookSessionApiV1MentorsSessionsSessionIdBookPost({ 
          sessionId, 
          requestBody: data 
        })
      ),
    onSuccess: (booking) => {
      const statusMessage =
        booking.status === 'confirmed'
          ? 'Session booked and confirmed!'
          : 'Booking request sent. Awaiting mentor confirmation.';

      toast({
        id: 'book-session-success',
        title: 'Session booked successfully',
        description: statusMessage,
        status: 'success',
      });

      // Invalidate all related queries to refresh UI
      invalidateAllQueries();
    },
    onError: (error) => {
      toast({
        id: 'book-session-error',
        title: 'Failed to book session',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  /**
   * Update booking status (flexible endpoint)
   * 
   * Allows any valid status transition with permission checks
   */
  const updateBookingStatus = useMutation<
    BookingPublic,
    Error,
    { bookingId: number; data: BookingStatusUpdate }
  >({
    mutationFn: ({ bookingId, data }) =>
      toNativePromise(
        MentorsService.updateBookingStatusApiV1MentorsBookingsBookingIdStatusPatch({ 
          bookingId, 
          requestBody: data 
        })
      ),
    onSuccess: (data) => {
      const statusMessages: Record<string, string> = {
        confirmed: 'Booking confirmed',
        cancelled_by_mentor: 'Booking cancelled',
        cancelled_by_mentee: 'Booking cancelled',
        completed: 'Session marked as completed',
        no_show_mentee: 'Marked as mentee no-show',
        no_show_mentor: 'Marked as mentor no-show',
        pending: 'Booking set to pending',
      };

      toast({
        id: 'update-booking-status-success',
        title: statusMessages[data.status] || 'Booking status updated',
        status: 'success',
      });

      // Invalidate all related queries
      invalidateAllQueries();
    },
    onError: (error) => {
      toast({
        id: 'update-booking-status-error',
        title: 'Failed to update booking status',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  /**
   * Confirm booking (mentor action - shortcut endpoint)
   * 
   * Transitions: PENDING → CONFIRMED
   */
  const confirmBookingMutation = useMutation<BookingPublic, Error, number>({
    mutationFn: (bookingId) =>
      toNativePromise(
        MentorsService.confirmBookingApiV1MentorsBookingsBookingIdConfirmPost({ bookingId })
      ),
    onSuccess: () => {
      toast({
        id: 'confirm-booking-success',
        title: 'Booking confirmed',
        description: 'The mentee will be notified.',
        status: 'success',
      });

      // Invalidate all related queries
      invalidateAllQueries();
    },
    onError: (error) => {
      toast({
        id: 'confirm-booking-error',
        title: 'Failed to confirm booking',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  /**
   * Deny booking (mentor action - shortcut endpoint)
   * 
   * Transitions: PENDING → CANCELLED_BY_MENTOR
   */
  const denyBookingMutation = useMutation<
    BookingPublic, 
    Error, 
    { bookingId: number; reason: string }
  >({
    mutationFn: ({ bookingId, reason }) =>
      toNativePromise(
        MentorsService.denyBookingApiV1MentorsBookingsBookingIdDenyPost({ 
          bookingId, 
          reason 
        })
      ),
    onSuccess: () => {
      toast({
        id: 'deny-booking-success',
        title: 'Booking denied',
        description: 'You may leave a review to explain why.',
        status: 'info',
      });

      // Invalidate all related queries
      invalidateAllQueries();
    },
    onError: (error) => {
      toast({
        id: 'deny-booking-error',
        title: 'Failed to deny booking',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  /**
   * Delete a booking (permanent removal)
   * 
   * Note: Consider using cancellation instead to maintain history
   */
  const deleteBooking = useMutation<void, Error, number>({
    mutationFn: (bookingId) =>
      toNativePromise(
        MentorsService.deleteBookingApiV1MentorsBookingsBookingIdDelete({ bookingId })
      ),
    onSuccess: () => {
      toast({
        id: 'delete-booking-success',
        title: 'Booking deleted successfully',
        status: 'success',
      });

      // Invalidate all queries
      invalidateAllQueries();
    },
    onError: (error) => {
      toast({
        id: 'delete-booking-error',
        title: 'Failed to delete booking',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // HELPER FUNCTIONS

  /**
   * Confirm a booking (mentor action)
   * 
   * Wrapper with callbacks for UI integration
   */
  const confirmBooking = async (bookingId: number, callbacks?: BookingCallbacks) => {
    setIsSubmitting(true);
    try {
      await confirmBookingMutation.mutateAsync(bookingId);
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
    }
  };

  /**
   * Deny a booking (mentor action)
   * 
   * Wrapper with callbacks for UI integration
   */
  const denyBooking = async (
    bookingId: number, 
    reason: string, 
    callbacks?: BookingCallbacks
  ) => {
    setIsSubmitting(true);
    try {
      await denyBookingMutation.mutateAsync({ bookingId, reason });
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
    }
  };

  /**
   * Cancel a booking (mentor or mentee action)
   * 
   * Determines correct cancellation status based on user role
   * (handled by backend based on who's making the request)
   */
  const cancelBooking = async (bookingId: number, callbacks?: BookingCallbacks) => {
    setIsSubmitting(true);
    try {
      // Backend will determine if this is CANCELLED_BY_MENTOR or CANCELLED_BY_MENTEE
      await updateBookingStatus.mutateAsync({
        bookingId,
        data: { status: 'cancelled_by_mentee' }, // You may want to detect this dynamically
      });
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
    }
  };

  /**
   * Complete a booking (mentor action)
   * 
   * Mark session as successfully completed
   */
  const completeBooking = async (bookingId: number, callbacks?: BookingCallbacks) => {
    setIsSubmitting(true);
    try {
      await updateBookingStatus.mutateAsync({
        bookingId,
        data: { status: 'completed' },
      });
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
    }
  };

  /**
   * Mark mentee as no-show (mentor action)
   */
  const markMenteeNoShow = async (bookingId: number, callbacks?: BookingCallbacks) => {
    setIsSubmitting(true);
    try {
      await updateBookingStatus.mutateAsync({
        bookingId,
        data: { status: 'no_show_mentee' },
      });
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
    }
  };

  // COMPUTED DATA

  const pendingBookings = bookings?.filter((b) => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter((b) => b.status === 'confirmed') || [];
  const completedBookings = bookings?.filter((b) => b.status === 'completed') || [];
  const cancelledBookings =
    bookings?.filter((b) =>
      ['cancelled_by_mentee', 'cancelled_by_mentor'].includes(b.status)
    ) || [];
  const noShowBookings =
    bookings?.filter((b) => ['no_show_mentee', 'no_show_mentor'].includes(b.status)) ||
    [];

  // RETURN API

  return {
    // ===== Data =====
    bookings,
    bookingHistory,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    noShowBookings,

    // ===== Loading States =====
    isLoading,
    isLoadingHistory,
    isError,
    error,
    isSubmitting,

    // ===== Refetch Functions =====
    refetch,
    refetchHistory,

    // ===== Mutation Actions =====
    bookSession: bookSession.mutate,
    bookSessionAsync: bookSession.mutateAsync,
    updateBookingStatus: updateBookingStatus.mutate,
    updateBookingStatusAsync: updateBookingStatus.mutateAsync,
    deleteBooking: deleteBooking.mutate,
    deleteBookingAsync: deleteBooking.mutateAsync,

    // ===== Helper Actions (with callbacks) =====
    confirmBooking,
    denyBooking,
    cancelBooking,
    completeBooking,
    markMenteeNoShow,

    // ===== Mutation States =====
    isBooking: bookSession.isPending,
    isUpdatingStatus: updateBookingStatus.isPending,
    isConfirming: confirmBookingMutation.isPending,
    isDenying: denyBookingMutation.isPending,
    isDeleting: deleteBooking.isPending,
  };
};