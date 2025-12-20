/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Goal } from '../models/Goal';
import type { GoalCreationRequest } from '../models/GoalCreationRequest';
import type { GoalUpdate } from '../models/GoalUpdate';
import type { LLMGenerationRequest } from '../models/LLMGenerationRequest';
import type { ProgressiveUpdateProposal } from '../models/ProgressiveUpdateProposal';
import type { RoadmapDisplay } from '../models/RoadmapDisplay';
import type { RoadmapPublic } from '../models/RoadmapPublic';
import type { RoadmapUpdate } from '../models/RoadmapUpdate';
import type { TaskStatus } from '../models/TaskStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GoalsService {
    /**
     * Create Goal
     * Create goal with optional AI-generated plan
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createGoalApiV1GoalsPost({
        requestBody,
    }: {
        requestBody: GoalCreationRequest,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/goals/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Goals
     * List user's goals, optionally filtered by roadmap
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listGoalsApiV1GoalsGet({
        skip,
        limit = 100,
        roadmapId,
    }: {
        skip?: number,
        limit?: number,
        roadmapId?: (number | null),
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals/',
            query: {
                'skip': skip,
                'limit': limit,
                'roadmap_id': roadmapId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Goals
     * Generate AI-curated goal options
     * @returns TaskStatus Successful Response
     * @throws ApiError
     */
    public static generateGoalsApiV1GoalsGeneratePost({
        requestBody,
    }: {
        requestBody: LLMGenerationRequest,
    }): CancelablePromise<TaskStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/goals/generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Confirm Progressive Update
     * Confirm and apply progressive update path
     * @returns TaskStatus Successful Response
     * @throws ApiError
     */
    public static confirmProgressiveUpdateApiV1GoalsConfirmProgressiveUpdatePost({
        requestBody,
    }: {
        requestBody: ProgressiveUpdateProposal,
    }): CancelablePromise<TaskStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/goals/confirm_progressive_update',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Check Task Status
     * Check async LLM task status
     * @returns TaskStatus Successful Response
     * @throws ApiError
     */
    public static checkTaskStatusApiV1GoalsTaskTaskIdGet({
        taskId,
    }: {
        taskId: string,
    }): CancelablePromise<TaskStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals/task/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Roadmaps
     * Get all user's roadmaps
     * @returns RoadmapPublic Successful Response
     * @throws ApiError
     */
    public static listRoadmapsApiV1GoalsRoadmapsGet(): CancelablePromise<Array<RoadmapPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals/roadmaps',
        });
    }
    /**
     * Get Roadmap Full
     * Get full roadmap with goals and boards
     * @returns RoadmapDisplay Successful Response
     * @throws ApiError
     */
    public static getRoadmapFullApiV1GoalsRoadmapsRoadmapIdFullGet({
        roadmapId,
    }: {
        roadmapId: number,
    }): CancelablePromise<RoadmapDisplay> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals/roadmaps/{roadmap_id}/full',
            path: {
                'roadmap_id': roadmapId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Roadmap
     * Update roadmap
     * @returns RoadmapPublic Successful Response
     * @throws ApiError
     */
    public static updateRoadmapApiV1GoalsRoadmapsRoadmapIdPatch({
        roadmapId,
        requestBody,
    }: {
        roadmapId: number,
        requestBody: RoadmapUpdate,
    }): CancelablePromise<RoadmapPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/goals/roadmaps/{roadmap_id}',
            path: {
                'roadmap_id': roadmapId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Public Roadmaps
     * Get user's public roadmaps
     * @returns RoadmapPublic Successful Response
     * @throws ApiError
     */
    public static getPublicRoadmapsApiV1GoalsUsersUserIdPublicRoadmapsGet({
        userId,
    }: {
        userId: number,
    }): CancelablePromise<Array<RoadmapPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals/users/{user_id}/public-roadmaps',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Goal
     * Update a goal
     * @returns Goal Successful Response
     * @throws ApiError
     */
    public static updateGoalApiV1GoalsGoalIdPatch({
        goalId,
        requestBody,
    }: {
        goalId: number,
        requestBody: GoalUpdate,
    }): CancelablePromise<Goal> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/goals/{goal_id}',
            path: {
                'goal_id': goalId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Goal
     * Delete a goal
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteGoalApiV1GoalsGoalIdDelete({
        goalId,
    }: {
        goalId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/goals/{goal_id}',
            path: {
                'goal_id': goalId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
