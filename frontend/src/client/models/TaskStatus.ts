/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LLMGenerationResponse } from './LLMGenerationResponse';
import type { TaskStatusEnum } from './TaskStatusEnum';
/**
 * Task status for async LLM operations
 */
export type TaskStatus = {
    task_id: string;
    status: TaskStatusEnum;
    message?: (string | null);
    result?: (LLMGenerationResponse | null);
};

