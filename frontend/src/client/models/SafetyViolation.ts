/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LLMTargetEntity } from './LLMTargetEntity';
import type { SafetyViolationType } from './SafetyViolationType';
export type SafetyViolation = {
    type: SafetyViolationType;
    message: string;
    severity: 'warning' | 'blocker' | 'review';
    suggested_action?: (Record<string, any> | null);
    affected_entities?: null;
    entity_type?: (Array<LLMTargetEntity> | null);
};

