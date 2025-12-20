/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoalDifficulty } from './GoalDifficulty';
import type { GoalStatus } from './GoalStatus';
export type GoalUpdate = {
    title?: (string | null);
    description?: (string | null);
    status?: (GoalStatus | null);
    difficulty?: (GoalDifficulty | null);
    importance?: (number | null);
    tags?: (Array<string> | null);
    start_date?: (string | null);
    target_date?: (string | null);
};

