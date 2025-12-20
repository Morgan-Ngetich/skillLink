/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LLMActionType } from './LLMActionType';
import type { LLMTargetEntity } from './LLMTargetEntity';
export type LLMGenerationRequest = {
    /**
     * Primary instruction for the LLM
     */
    prompt: string;
    /**
     * Includes user capabilities and historical progress
     */
    context?: Record<string, any>;
    action?: LLMActionType;
    model?: 'gpt-3.5-turbo' | 'gpt-4' | 'falcon-7b' | 'falcon-7b-instruct' | 'claude-2' | 'compound-beta-mini';
    temperature?: number;
    /**
     * Maximum number of tokens to generate
     */
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    target_entities?: Array<LLMTargetEntity>;
    update_constraints?: Record<string, any>;
    format?: 'structured' | 'raw';
    user_intent?: (string | null);
};

