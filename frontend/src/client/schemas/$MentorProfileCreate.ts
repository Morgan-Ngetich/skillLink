/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MentorProfileCreate = {
    properties: {
        user_id: {
            type: 'number',
            isRequired: true,
        },
        title: {
            type: 'string',
            isRequired: true,
        },
        industries: {
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
        expertise: {
            type: 'array',
            contains: {
                type: 'string',
            },
            isRequired: true,
        },
        experience_level: {
            type: 'ExperienceLevel',
            isRequired: true,
        },
        mentor_type: {
            type: 'any-of',
            contains: [{
                type: 'array',
                contains: {
                    type: 'MentorType',
                },
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
        badges: {
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
    },
} as const;
