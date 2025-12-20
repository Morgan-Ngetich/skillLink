/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExperienceLevel } from './ExperienceLevel';
import type { MentorType } from './MentorType';
export type MentorProfileUpdate = {
    title?: (string | null);
    industries?: (Array<string> | null);
    expertise?: (Array<string> | null);
    experience_level?: (ExperienceLevel | null);
    mentor_type?: (Array<MentorType> | null);
    tags?: (Array<string> | null);
    badges?: (Array<string> | null);
};

