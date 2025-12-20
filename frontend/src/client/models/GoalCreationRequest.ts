/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoalDifficulty } from './GoalDifficulty';
import type { GoalType } from './GoalType';
/**
 * User-facing model to create goals with optional AI assistance
 */
export type GoalCreationRequest = {
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
    /**
     * Whether to generate a roadmap and tasks using AI
     */
    generate_plan?: boolean;
    /**
     * Optional parameters for customizing AI generation
     */
    ai_settings?: (Record<string, any> | null);
};

