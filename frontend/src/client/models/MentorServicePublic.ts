/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Service without nested mentor
 */
export type MentorServicePublic = {
    id: number;
    uuid: string;
    mentor_id: number;
    title: string;
    description?: (string | null);
    banner_url?: (string | null);
    price_usd?: (number | null);
    estimated_duration_minutes?: (number | null);
    category?: (string | null);
    highlights?: (Array<string> | null);
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

