/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BookingPublic = {
    description: `Booking without nested session`,
    properties: {
        id: {
            type: 'number',
            isRequired: true,
        },
        uuid: {
            type: 'string',
            isRequired: true,
            format: 'uuid',
        },
        session_id: {
            type: 'number',
            isRequired: true,
        },
        mentee: {
            type: 'any-of',
            contains: [{
                type: 'UserMinimal',
            }, {
                type: 'null',
            }],
        },
        status: {
            type: 'BookingStatus',
            isRequired: true,
        },
        message: {
            type: 'any-of',
            contains: [{
                type: 'string',
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
    },
} as const;
