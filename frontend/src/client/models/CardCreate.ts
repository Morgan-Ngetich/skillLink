/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CardPriority } from './CardPriority';
import type { CardStatus } from './CardStatus';
export type CardCreate = {
    title: string;
    description?: (string | null);
    status?: CardStatus;
    priority?: CardPriority;
    position?: number;
    tags?: (Array<string> | null);
    due_date?: (string | null);
    estimated_duration?: (number | null);
    is_archived?: boolean;
};

