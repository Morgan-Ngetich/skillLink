// This types matches MentorSettingsUpdate but makes all fields required for the form state
export type MentorSettingsForm = {
  currently_open_to_mentees: boolean;
  profile_visibility: boolean;
  allow_public_availability_view: boolean;
  auto_accept_bookings: boolean;
  require_intro_message: boolean;
  booking_buffer_hours: number;
  session_gap_minutes: number;
  max_mentees: number;
  mentorship_philosophy: string;
  ideal_mentee_description: string;
  communication_style: string[];
  response_time_hours: number;
  timezone: string;
};
