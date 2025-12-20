/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MentorSessionPublic = {
    description: `Session without nested mentor profile`,
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
        mentor_id: {
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
        cover_image: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        session_type: {
            type: 'string',
            isRequired: true,
        },
        duration_minutes: {
            type: 'number',
            isRequired: true,
        },
        price_usd: {
            type: 'any-of',
            contains: [{
                type: 'number',
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
        start_time: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        end_time: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        timezone: {
            type: 'string',
            isRequired: true,
        },
        is_public: {
            type: 'boolean',
            isRequired: true,
        },
        is_cancelled: {
            type: 'boolean',
            isRequired: true,
        },
        is_active: {
            type: 'boolean',
            isRequired: true,
        },
        max_bookings: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        location_type: {
            type: 'LocationType',
            isRequired: true,
        },
        meeting_link: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        physical_address: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        preparation_materials: {
            type: 'any-of',
            contains: [{
                type: 'array',
                contains: {
                    type: 'PreparationMaterial',
                },
            }, {
                type: 'null',
            }],
        },
        total_bookings: {
            type: 'number',
            isRequired: true,
        },
        confirmed_bookings: {
            type: 'number',
            isRequired: true,
        },
        pending_bookings: {
            type: 'number',
            isRequired: true,
        },
        is_full: {
            type: 'boolean',
            isRequired: true,
        },
        available_spots: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        user_has_booked: {
            type: 'boolean',
        },
        bookings: {
            type: 'array',
            contains: {
                type: 'BookingPublic',
            },
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
