/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingPublic } from './BookingPublic';
import type { LocationType } from './LocationType';
import type { PreparationMaterial } from './PreparationMaterial';
/**
 * Session without nested mentor profile
 */
export type MentorSessionPublic = {
    id: number;
    uuid: string;
    mentor_id: number;
    title: string;
    description?: (string | null);
    cover_image?: (string | null);
    session_type: string;
    duration_minutes: number;
    price_usd?: (number | null);
    tags?: (Array<string> | null);
    start_time: string;
    end_time: string;
    timezone: string;
    is_public: boolean;
    is_cancelled: boolean;
    is_active: boolean;
    max_bookings?: (number | null);
    location_type: LocationType;
    meeting_link?: (string | null);
    physical_address?: (string | null);
    preparation_materials?: (Array<PreparationMaterial> | null);
    total_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    is_full: boolean;
    available_spots?: (number | null);
    user_has_booked?: boolean;
    bookings?: Array<BookingPublic>;
    created_at: string;
    updated_at: string;
};

