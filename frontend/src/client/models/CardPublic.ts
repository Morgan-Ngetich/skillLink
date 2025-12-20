/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoalPublic } from './GoalPublic';
import type { UserPublic } from './UserPublic';
/**
 * Public card without nested board/list
 */
export type CardPublic = {
    id: number;
    title: string;
    description?: (string | null);
    status: string;
    priority: string;
    position?: number;
    tags?: (Array<string> | null);
    due_date?: (string | null);
    estimated_duration?: (number | null);
    is_archived?: boolean;
    created_at: string;
    updated_at: string;
    assignee?: (UserPublic | null);
    created_by?: (UserPublic | null);
    goal?: (GoalPublic | null);
};

