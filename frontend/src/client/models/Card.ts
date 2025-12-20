/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CardPriority } from './CardPriority';
import type { CardStatus } from './CardStatus';
export type Card = {
    title: string;
    description?: (string | null);
    status?: CardStatus;
    priority?: CardPriority;
    position?: number;
    tags?: (Array<string> | null);
    due_date?: (string | null);
    estimated_duration?: (number | null);
    is_archived?: boolean;
    id?: (number | null);
    list_id: number;
    goal_id?: (number | null);
    roadmap_id?: (number | null);
    assignee_id?: (number | null);
    created_by_id: number;
    created_at?: string;
    updated_at?: string;
};

