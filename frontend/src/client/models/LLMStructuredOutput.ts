/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoardCreate } from './BoardCreate';
import type { CardCreate } from './CardCreate';
import type { GoalCreate } from './GoalCreate';
import type { ProgressiveUpdateProposal } from './ProgressiveUpdateProposal';
import type { RoadCreate } from './RoadCreate';
import type { SafetyReport } from './SafetyReport';
export type LLMStructuredOutput = {
    /**
     * Structured output containing created entities like goals, roadmaps, or cards
     */
    creations?: (Record<string, Array<(GoalCreate | RoadCreate | CardCreate | BoardCreate | Record<string, any>)>> | null);
    updates?: null;
    /**
     * When multi-step progression is needed
     */
    progressive_updates?: (Array<ProgressiveUpdateProposal> | null);
    analysis?: (string | null);
    resources?: Array<Record<string, string>>;
    safety_report?: SafetyReport;
};

