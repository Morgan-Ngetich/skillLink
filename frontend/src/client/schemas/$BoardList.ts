/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BoardList = {
    properties: {
        title: {
            type: 'string',
            isRequired: true,
        },
        position: {
            type: 'number',
        },
        is_archived: {
            type: 'boolean',
        },
        status: {
            type: 'any-of',
            contains: [{
                type: 'CardStatus',
            }, {
                type: 'null',
            }],
        },
        id: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        board_id: {
            type: 'number',
            isRequired: true,
        },
        is_llm_generated: {
            type: 'boolean',
        },
        created_at: {
            type: 'string',
            format: 'date-time',
        },
        updated_at: {
            type: 'string',
            format: 'date-time',
        },
    },
} as const;
