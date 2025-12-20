/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CardStatus } from './CardStatus';
export type BoardList = {
    title: string;
    position?: number;
    is_archived?: boolean;
    status?: (CardStatus | null);
    id?: (number | null);
    board_id: number;
    is_llm_generated?: boolean;
    created_at?: string;
    updated_at?: string;
};

