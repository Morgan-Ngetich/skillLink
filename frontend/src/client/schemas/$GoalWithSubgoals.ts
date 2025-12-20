/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $GoalWithSubgoals = {
    description: `Goal with nested subgoals structure`,
    properties: {
        goal: {
            type: 'GoalPublic',
            isRequired: true,
        },
        subgoals: {
            type: 'array',
            contains: {
                type: 'GoalWithSubgoals',
            },
        },
        cards: {
            type: 'array',
            contains: {
                type: 'CardPublic',
            },
        },
        progress: {
            type: 'number',
            maximum: 1,
        },
    },
} as const;
