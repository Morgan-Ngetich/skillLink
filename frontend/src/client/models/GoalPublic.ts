/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoalDifficulty } from './GoalDifficulty';
import type { GoalStatus } from './GoalStatus';
import type { GoalType } from './GoalType';
/**
 * Public goal without nested data
 */
export type GoalPublic = {
    id: number;
    owner_id: number;
    roadmap_id?: (number | null);
    parent_goal_id?: (number | null);
    title: string;
    description?: (string | null);
    type: GoalType;
    difficulty: GoalDifficulty;
    importance?: (number | null);
    tags?: (Array<string> | null);
    start_date?: (string | null);
    target_date?: (string | null);
    status: GoalStatus;
    is_llm_generated: boolean;
    created_at: string;
    updated_at: string;
};

