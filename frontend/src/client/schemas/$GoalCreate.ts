/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $GoalCreate = {
    description: `User-facing input model (only editable fields)`,
    properties: {
        title: {
            type: 'string',
            isRequired: true,
        },
        description: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        type: {
            type: 'GoalType',
            description: `Category of goal: skill, project, career, or personal`,
        },
        difficulty: {
            type: 'GoalDifficulty',
            description: `Estimated challenge level: very_easy, easy, medium, hard, very_hard`,
        },
        importance: {
            type: 'any-of',
            contains: [{
                type: 'number',
                maximum: 5,
                minimum: 1,
            }, {
                type: 'null',
            }],
        },
        tags: {
            type: 'any-of',
            contains: [{
                type: 'array',
                contains: {
                    type: 'string',
                },
            }, {
                type: 'null',
            }],
        },
        start_date: {
            type: 'any-of',
            contains: [{
                type: 'string',
                format: 'date-time',
            }, {
                type: 'null',
            }],
        },
        target_date: {
            type: 'any-of',
            contains: [{
                type: 'string',
                format: 'date-time',
            }, {
                type: 'null',
            }],
        },
    },
} as const;
