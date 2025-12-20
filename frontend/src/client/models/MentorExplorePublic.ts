/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExperienceLevel } from './ExperienceLevel';
export type MentorExplorePublic = {
    user_id: number;
    uuid: string;
    full_name: (string | null);
    avatar_url: (string | null);
    cover_image: (string | null);
    title: string;
    about: (string | null);
    skills: (Array<string> | null);
    location: string;
    expertise: Array<string>;
    area_of_focus: (Array<string> | null);
    experience_level: ExperienceLevel;
    average_rating: (number | null);
    total_sessions: number;
    total_mentees: number;
    is_available: boolean;
    min_session_price: (number | null);
    max_session_price: (number | null);
    avg_session_price: (number | null);
};
