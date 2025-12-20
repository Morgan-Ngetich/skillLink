/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UsersPublic = {
    description: `List of users with count`,
    properties: {
        data: {
            type: 'array',
            contains: {
                type: 'UserPublic',
            },
            isRequired: true,
        },
        count: {
            type: 'number',
            isRequired: true,
        },
    },
} as const;
