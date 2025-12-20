/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Comprehensive mentor statistics
 */
export type MentorStatsPublic = {
    completion_percentage: number;
    is_complete: boolean;
    total_sessions: number;
    active_sessions: number;
    upcoming_sessions: number;
    past_sessions: number;
    total_bookings: number;
    active_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    completed_bookings: number;
    total_cancelled: number;
    cancelled_by_mentee: number;
    cancelled_by_mentor: number;
    expired_bookings: number;
    total_no_shows: number;
    no_show_mentee: number;
    no_show_mentor: number;
    completion_rate: number;
    cancellation_rate: number;
    no_show_rate: number;
    total_mentees: number;
    average_rating?: (number | null);
};

