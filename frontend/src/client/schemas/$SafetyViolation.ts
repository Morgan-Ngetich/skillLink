/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SafetyViolation = {
    properties: {
        type: {
            type: 'SafetyViolationType',
            isRequired: true,
        },
        message: {
            type: 'string',
            isRequired: true,
        },
        severity: {
            type: 'Enum',
            isRequired: true,
        },
        suggested_action: {
            type: 'any-of',
            contains: [{
                type: 'dictionary',
                contains: {
                    properties: {
                    },
                },
            }, {
                type: 'null',
            }],
        },
        affected_entities: {
            type: 'any-of',
            contains: [{
                type: 'null',
            }],
        },
        entity_type: {
            type: 'any-of',
            contains: [{
                type: 'array',
                contains: {
                    type: 'LLMTargetEntity',
                },
            }, {
                type: 'null',
            }],
        },
    },
} as const;
