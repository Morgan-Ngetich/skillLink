/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MentorProfilePublic = {
    description: `Complete public mentor profile`,
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
        total_sessions: {
            type: 'number',
            isRequired: true,
        },
        total_mentees: {
            type: 'number',
            isRequired: true,
        },
        average_rating: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
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
        user: {
            type: 'any-of',
            contains: [{
                type: 'UserMinimal',
            }, {
                type: 'null',
            }],
        },
        sessions: {
            type: 'array',
            contains: {
                type: 'MentorSessionPublic',
            },
        },
        services: {
            type: 'array',
            contains: {
                type: 'MentorServicePublic',
            },
        },
        settings: {
            type: 'any-of',
            contains: [{
                type: 'MentorSettingsPublic',
            }, {
                type: 'null',
            }],
        },
    },
} as const;
