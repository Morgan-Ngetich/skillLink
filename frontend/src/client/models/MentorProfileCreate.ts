/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExperienceLevel } from './ExperienceLevel';
import type { MentorType } from './MentorType';
export type MentorProfileCreate = {
    user_id: number;
    title: string;
    industries?: (Array<string> | null);
    expertise: Array<string>;
    experience_level: ExperienceLevel;
    mentor_type?: (Array<MentorType> | null);
    tags?: (Array<string> | null);
    badges?: (Array<string> | null);
};

