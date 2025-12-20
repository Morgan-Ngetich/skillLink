/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LLMStructuredOutput = {
    properties: {
        creations: {
            type: 'any-of',
            description: `Structured output containing created entities like goals, roadmaps, or cards`,
            contains: [{
                type: 'dictionary',
                contains: {
                    type: 'array',
                    contains: {
                        type: 'any-of',
                        contains: [{
                            type: 'GoalCreate',
                        }, {
                            type: 'RoadCreate',
                        }, {
                            type: 'CardCreate',
                        }, {
                            type: 'BoardCreate',
                        }, {
                            type: 'dictionary',
                            contains: {
                                properties: {
                                },
                            },
                        }],
                    },
                },
            }, {
                type: 'null',
            }],
        },
        updates: {
            type: 'any-of',
            contains: [{
                type: 'null',
            }],
        },
        progressive_updates: {
            type: 'any-of',
            description: `When multi-step progression is needed`,
            contains: [{
                type: 'array',
                contains: {
                    type: 'ProgressiveUpdateProposal',
                },
            }, {
                type: 'null',
            }],
        },
        analysis: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        resources: {
            type: 'array',
            contains: {
                type: 'dictionary',
                contains: {
                    type: 'string',
                },
            },
        },
        safety_report: {
            type: 'SafetyReport',
        },
    },
} as const;
