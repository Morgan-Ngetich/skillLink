/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BoardWithLists = {
    description: `Board with nested lists and cards`,
    properties: {
        board: {
            type: 'Board',
            isRequired: true,
        },
        lists: {
            type: 'array',
            contains: {
                type: 'ListWithCards',
            },
        },
        active_card_count: {
            type: 'number',
            isReadOnly: true,
            isRequired: true,
        },
    },
} as const;
