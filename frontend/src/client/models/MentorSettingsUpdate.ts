/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MentorSettingsUpdate = {
    currently_open_to_mentees?: (boolean | null);
    profile_visibility?: (boolean | null);
    auto_accept_bookings?: (boolean | null);
    require_intro_message?: (boolean | null);
    allow_public_availability_view?: (boolean | null);
    timezone?: (string | null);
    available_times?: (Array<string> | null);
    weekly_schedule?: (Record<string, any> | null);
    booking_buffer_hours?: (number | null);
    session_gap_minutes?: (number | null);
    max_mentees?: (number | null);
    mentorship_philosophy?: (string | null);
    ideal_mentee_description?: (string | null);
    communication_style?: (Array<string> | null);
    response_time_hours?: (number | null);
};

