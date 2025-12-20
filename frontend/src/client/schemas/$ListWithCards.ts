/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ListWithCards = {
    description: `BoardList with its cards`,
    properties: {
        boardlist: {
            type: 'BoardList',
            isRequired: true,
        },
        cards: {
            type: 'array',
            contains: {
                type: 'CardPublic',
            },
        },
        card_count: {
            type: 'number',
            isReadOnly: true,
            isRequired: true,
        },
    },
} as const;
