/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Education } from './Education';
import type { Experience } from './Experience';
export type UserProfileUpdate = {
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
};

