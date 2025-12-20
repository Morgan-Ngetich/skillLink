/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocationType } from './LocationType';
import type { PreparationMaterial } from './PreparationMaterial';
import type { SessionType } from './SessionType';
export type MentorSessionUpdate = {
    title?: (string | null);
    description?: (string | null);
    cover_image?: (string | null);
    session_type?: (SessionType | null);
    duration_minutes?: (number | null);
    price_usd?: (number | null);
    is_public?: (boolean | null);
    is_active?: (boolean | null);
    max_bookings?: (number | null);
    tags?: (Array<string> | null);
    location_type?: (LocationType | null);
    meeting_link?: (string | null);
    physical_address?: (string | null);
    preparation_materials?: (Array<PreparationMaterial> | null);
    start_time?: (string | null);
    end_time?: (string | null);
};

