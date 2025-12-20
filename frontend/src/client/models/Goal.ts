/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoalDifficulty } from './GoalDifficulty';
import type { GoalStatus } from './GoalStatus';
import type { GoalType } from './GoalType';
export type Goal = {
    title: string;
    description?: (string | null);
    /**
     * Category of goal: skill, project, career, or personal
     */
    type?: GoalType;
    /**
     * Estimated challenge level: very_easy, easy, medium, hard, very_hard
     */
    difficulty?: GoalDifficulty;
    importance?: (number | null);
    tags?: (Array<string> | null);
    start_date?: (string | null);
    target_date?: (string | null);
    id?: (number | null);
    owner_id: number;
    roadmap_id?: (number | null);
    parent_goal_id?: (number | null);
    status?: GoalStatus;
    is_llm_generated?: boolean;
    llm_metadata?: (Record<string, any> | null);
    created_at?: string;
    updated_at?: string;
};

