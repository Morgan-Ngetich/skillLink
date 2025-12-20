/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoardWithLists } from './BoardWithLists';
import type { GoalWithSubgoals } from './GoalWithSubgoals';
import type { Roadmap } from './Roadmap';
/**
 * Combined view for displaying roadmap hierarchy
 */
export type RoadmapDisplay = {
    roadmap: Roadmap;
    goals?: Array<GoalWithSubgoals>;
    boards?: Array<BoardWithLists>;
};

