/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SafetyReport = {
    properties: {
        violations: {
            type: 'array',
            contains: {
                type: 'SafetyViolation',
            },
        },
        passes: {
            type: 'boolean',
        },
        requires_human_review: {
            type: 'boolean',
        },
    },
} as const;
