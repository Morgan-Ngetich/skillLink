/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RoadmapDisplay = {
    description: `Combined view for displaying roadmap hierarchy`,
    properties: {
        roadmap: {
            type: 'Roadmap',
            isRequired: true,
        },
        goals: {
            type: 'array',
            contains: {
                type: 'GoalWithSubgoals',
            },
        },
        boards: {
            type: 'array',
            contains: {
                type: 'BoardWithLists',
            },
        },
    },
} as const;
