/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CardPublic } from './CardPublic';
import type { GoalPublic } from './GoalPublic';
/**
 * Goal with nested subgoals structure
 */
export type GoalWithSubgoals = {
    goal: GoalPublic;
    subgoals?: Array<GoalWithSubgoals>;
    cards?: Array<CardPublic>;
    progress?: number;
};

