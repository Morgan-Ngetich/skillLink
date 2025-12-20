/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExperienceLevel } from './ExperienceLevel';
import type { MentorServicePublic } from './MentorServicePublic';
import type { MentorSessionPublic } from './MentorSessionPublic';
import type { MentorSettingsPublic } from './MentorSettingsPublic';
import type { MentorType } from './MentorType';
import type { UserMinimal } from './UserMinimal';
/**
 * Complete public mentor profile
 */
export type MentorProfilePublic = {
    user_id: number;
    title: string;
    industries?: (Array<string> | null);
    expertise: Array<string>;
    experience_level: ExperienceLevel;
    mentor_type?: (Array<MentorType> | null);
    tags?: (Array<string> | null);
    badges?: (Array<string> | null);
    total_sessions: number;
    total_mentees: number;
    average_rating?: (number | null);
    created_at: string;
    updated_at: string;
    user?: (UserMinimal | null);
    sessions?: Array<MentorSessionPublic>;
    services?: Array<MentorServicePublic>;
    settings?: (MentorSettingsPublic | null);
};

