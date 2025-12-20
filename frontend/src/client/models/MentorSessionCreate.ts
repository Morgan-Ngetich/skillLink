/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocationType } from './LocationType';
import type { PreparationMaterial } from './PreparationMaterial';
import type { SessionType } from './SessionType';
export type MentorSessionCreate = {
    mentor_id: number;
    title: string;
    description?: (string | null);
    cover_image?: (string | null);
    session_type: SessionType;
    duration_minutes?: number;
    price_usd?: (number | null);
    tags?: (Array<string> | null);
    start_time: string;
    end_time: string;
    timezone?: string;
    is_public?: (boolean | null);
    is_active?: boolean;
    max_bookings?: (number | null);
    location_type?: LocationType;
    meeting_link?: (string | null);
    physical_address?: (string | null);
    preparation_materials?: (Array<PreparationMaterial> | null);
};

