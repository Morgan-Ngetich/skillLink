/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Education } from './Education';
import type { Experience } from './Experience';
import type { MentorProfilePublic } from './MentorProfilePublic';
/**
 * User profile with optional mentor profile nested
 */
export type UserProfilePublic = {
    user_id: number;
    uuid: string;
    title?: (string | null);
    about?: (string | null);
    location?: (string | null);
    area_of_focus?: (Array<string> | null);
    goals?: (Array<string> | null);
    interests?: (Array<string> | null);
    skills?: (Array<string> | null);
    social_links?: (Record<string, string> | null);
    contact_details?: (Record<string, string> | null);
    education?: (Array<Education> | null);
    experience?: (Array<Experience> | null);
    is_profile_complete?: (boolean | null);
    is_profile_setup_complete?: (boolean | null);
    created_at?: (string | null);
    updated_at?: (string | null);
    mentor_profile?: (MentorProfilePublic | null);
};

