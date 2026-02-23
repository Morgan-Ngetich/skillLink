/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingPublic } from './BookingPublic';
import type { BookingStatus } from './BookingStatus';
import type { LocationType } from './LocationType';
import type { PreparationMaterial } from './PreparationMaterial';
import type { UserMinimal } from './UserMinimal';
/**
 * Session without nested mentor profile
 */
export type MentorSessionPublic = {
    id: number;
    uuid: string;
    mentor_id: number;
    mentor: UserMinimal;
    title: string;
    description?: (string | null);
    cover_image?: (string | null);
    duration_minutes: number;
    price_usd?: (number | null);
    tags?: (Array<string> | null);
    start_time: string;
    end_time: string;
    timezone: string;
    is_public: boolean;
    is_cancelled: boolean;
    is_active: boolean;
    is_owner: boolean;
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
    user_cancelled_by_mentor?: boolean;
    user_booking_status?: (BookingStatus | null);
    bookings?: Array<BookingPublic>;
    created_at: string;
    updated_at: string;
};

