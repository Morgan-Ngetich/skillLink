/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UserProfileUpdate = {
    properties: {
        title: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        about: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        location: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        area_of_focus: {
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
        goals: {
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
        interests: {
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
        skills: {
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
        social_links: {
            type: 'any-of',
            contains: [{
                type: 'dictionary',
                contains: {
                    type: 'string',
                },
            }, {
                type: 'null',
            }],
        },
        contact_details: {
            type: 'any-of',
            contains: [{
                type: 'dictionary',
                contains: {
                    type: 'string',
                },
            }, {
                type: 'null',
            }],
        },
        education: {
            type: 'any-of',
            contains: [{
                type: 'array',
                contains: {
                    type: 'Education',
                },
            }, {
                type: 'null',
            }],
        },
        experience: {
            type: 'any-of',
            contains: [{
                type: 'array',
                contains: {
                    type: 'Experience',
                },
            }, {
                type: 'null',
            }],
        },
    },
} as const;
