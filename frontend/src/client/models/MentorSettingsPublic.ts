/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Public mentor settings
 */
export type MentorSettingsPublic = {
    id: number;
    mentor_id: number;
    currently_open_to_mentees: boolean;
    profile_visibility: boolean;
    auto_accept_bookings: boolean;
    require_intro_message: boolean;
    allow_public_availability_view: boolean;
    timezone?: (string | null);
    available_times?: (Array<string> | null);
    weekly_schedule?: (Record<string, any> | null);
    booking_buffer_hours: number;
    session_gap_minutes: number;
    max_mentees?: (number | null);
    mentorship_philosophy?: (string | null);
    ideal_mentee_description?: (string | null);
    communication_style?: (Array<string> | null);
    response_time_hours: number;
    created_at: string;
    updated_at: string;
};

