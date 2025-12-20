/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Board } from './Board';
import type { Card } from './Card';
import type { Goal } from './Goal';
import type { Roadmap } from './Roadmap';
import type { UserProfilePublic } from './UserProfilePublic';
/**
 * Complete public user data with all relationships
 */
export type UserPublic = {
    id: number;
    uuid: string;
    full_name: string;
    email: string;
    avatar_url?: (string | null);
    cover_image?: (string | null);
    is_superuser: boolean;
    is_mentor: boolean;
    is_mentee: boolean;
    profile?: (UserProfilePublic | null);
    created_at?: (string | null);
    updated_at?: (string | null);
    roadmap_count?: number;
    active_goal_count?: number;
    boards?: Array<Board>;
    roadmaps?: Array<Roadmap>;
    goals?: Array<Goal>;
    assigned_cards?: Array<Card>;
    created_cards?: Array<Card>;
};

