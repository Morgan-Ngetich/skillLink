/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CardPublic = {
    description: `Public card without nested board/list`,
    properties: {
        id: {
            type: 'number',
            isRequired: true,
        },
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
        status: {
            type: 'string',
            isRequired: true,
        },
        priority: {
            type: 'string',
            isRequired: true,
        },
        position: {
            type: 'number',
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
        due_date: {
            type: 'any-of',
            contains: [{
                type: 'string',
                format: 'date-time',
            }, {
                type: 'null',
            }],
        },
        estimated_duration: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        is_archived: {
            type: 'boolean',
        },
        created_at: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        updated_at: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        assignee: {
            type: 'any-of',
            contains: [{
                type: 'UserPublic',
            }, {
                type: 'null',
            }],
        },
        created_by: {
            type: 'any-of',
            contains: [{
                type: 'UserPublic',
            }, {
                type: 'null',
            }],
        },
        goal: {
            type: 'any-of',
            contains: [{
                type: 'GoalPublic',
            }, {
                type: 'null',
            }],
        },
    },
} as const;
