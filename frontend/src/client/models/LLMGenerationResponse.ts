/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LLMActionType } from './LLMActionType';
import type { LLMStructuredOutput } from './LLMStructuredOutput';
import type { SafetyReport } from './SafetyReport';
/**
 * Public LLM generation response
 */
export type LLMGenerationResponse = {
    request_id: string;
    action: LLMActionType;
    output: (LLMStructuredOutput | string);
    /**
     * LLM provider-specific metadata like tokens used, processing time, etc.
     */
    model_metadata?: Record<string, any>;
    safety_check?: SafetyReport;
    /**
     * Presented when confirmation required
     */
    user_options?: (Record<string, any> | null);
};

