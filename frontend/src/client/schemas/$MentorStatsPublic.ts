/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MentorStatsPublic = {
    description: `Comprehensive mentor statistics`,
    properties: {
        completion_percentage: {
            type: 'number',
            isRequired: true,
        },
        is_complete: {
            type: 'boolean',
            isRequired: true,
        },
        total_sessions: {
            type: 'number',
            isRequired: true,
        },
        active_sessions: {
            type: 'number',
            isRequired: true,
        },
        upcoming_sessions: {
            type: 'number',
            isRequired: true,
        },
        past_sessions: {
            type: 'number',
            isRequired: true,
        },
        total_bookings: {
            type: 'number',
            isRequired: true,
        },
        active_bookings: {
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
        completed_bookings: {
            type: 'number',
            isRequired: true,
        },
        total_cancelled: {
            type: 'number',
            isRequired: true,
        },
        cancelled_by_mentee: {
            type: 'number',
            isRequired: true,
        },
        cancelled_by_mentor: {
            type: 'number',
            isRequired: true,
        },
        expired_bookings: {
            type: 'number',
            isRequired: true,
        },
        total_no_shows: {
            type: 'number',
            isRequired: true,
        },
        no_show_mentee: {
            type: 'number',
            isRequired: true,
        },
        no_show_mentor: {
            type: 'number',
            isRequired: true,
        },
        completion_rate: {
            type: 'number',
            isRequired: true,
        },
        cancellation_rate: {
            type: 'number',
            isRequired: true,
        },
        no_show_rate: {
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
    },
} as const;
