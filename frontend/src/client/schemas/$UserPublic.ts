/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UserPublic = {
    description: `Complete public user data with all relationships`,
    properties: {
        id: {
            type: 'number',
            isRequired: true,
        },
        uuid: {
            type: 'string',
            isRequired: true,
        },
        full_name: {
            type: 'string',
            isRequired: true,
        },
        email: {
            type: 'string',
            isRequired: true,
        },
        avatar_url: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        cover_image: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        is_superuser: {
            type: 'boolean',
            isRequired: true,
        },
        is_mentor: {
            type: 'boolean',
            isRequired: true,
        },
        is_mentee: {
            type: 'boolean',
            isRequired: true,
        },
        profile: {
            type: 'any-of',
            contains: [{
                type: 'UserProfilePublic',
            }, {
                type: 'null',
            }],
        },
        created_at: {
            type: 'any-of',
            contains: [{
                type: 'string',
                format: 'date-time',
            }, {
                type: 'null',
            }],
        },
        updated_at: {
            type: 'any-of',
            contains: [{
                type: 'string',
                format: 'date-time',
            }, {
                type: 'null',
            }],
        },
        roadmap_count: {
            type: 'number',
        },
        active_goal_count: {
            type: 'number',
        },
        boards: {
            type: 'array',
            contains: {
                type: 'Board',
            },
        },
        roadmaps: {
            type: 'array',
            contains: {
                type: 'Roadmap',
            },
        },
        goals: {
            type: 'array',
            contains: {
                type: 'Goal',
            },
        },
        assigned_cards: {
            type: 'array',
            contains: {
                type: 'Card',
            },
        },
        created_cards: {
            type: 'array',
            contains: {
                type: 'Card',
            },
        },
    },
} as const;
