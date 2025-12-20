/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LLMGenerationResponse = {
    description: `Public LLM generation response`,
    properties: {
        request_id: {
            type: 'string',
            isRequired: true,
        },
        action: {
            type: 'LLMActionType',
            isRequired: true,
        },
        output: {
            type: 'any-of',
            contains: [{
                type: 'LLMStructuredOutput',
            }, {
                type: 'string',
            }],
            isRequired: true,
        },
        model_metadata: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        safety_check: {
            type: 'SafetyReport',
        },
        user_options: {
            type: 'any-of',
            description: `Presented when confirmation required`,
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
    },
} as const;
