/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingStatus } from './BookingStatus';
import type { UserMinimal } from './UserMinimal';
/**
 * Booking without nested session
 */
export type BookingPublic = {
    id: number;
    uuid: string;
    session_id: number;
    mentee?: (UserMinimal | null);
    status: BookingStatus;
    message?: (string | null);
    created_at: string;
    updated_at: string;
};

