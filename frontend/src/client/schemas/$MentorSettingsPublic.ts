/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MentorSettingsPublic = {
    description: `Public mentor settings`,
    properties: {
        id: {
            type: 'number',
            isRequired: true,
        },
        mentor_id: {
            type: 'number',
            isRequired: true,
        },
        currently_open_to_mentees: {
            type: 'boolean',
            isRequired: true,
        },
        profile_visibility: {
            type: 'boolean',
            isRequired: true,
        },
        auto_accept_bookings: {
            type: 'boolean',
            isRequired: true,
        },
        require_intro_message: {
            type: 'boolean',
            isRequired: true,
        },
        allow_public_availability_view: {
            type: 'boolean',
            isRequired: true,
        },
        timezone: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        available_times: {
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
        weekly_schedule: {
            type: 'any-of',
            contains: [{
                type: 'dictionary',
                contains: {
                    properties: {
                    },
                },
            }, {
                type: 'null',
            }],
        },
        booking_buffer_hours: {
            type: 'number',
            isRequired: true,
        },
        session_gap_minutes: {
            type: 'number',
            isRequired: true,
        },
        max_mentees: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        mentorship_philosophy: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        ideal_mentee_description: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        communication_style: {
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
        response_time_hours: {
            type: 'number',
            isRequired: true,
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
