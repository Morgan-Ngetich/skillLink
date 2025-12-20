/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LLMGenerationRequest = {
    properties: {
        prompt: {
            type: 'string',
            description: `Primary instruction for the LLM`,
            isRequired: true,
        },
        context: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        action: {
            type: 'LLMActionType',
        },
        model: {
            type: 'Enum',
        },
        temperature: {
            type: 'number',
            maximum: 1,
        },
        max_tokens: {
            type: 'number',
            description: `Maximum number of tokens to generate`,
            maximum: 4096,
            minimum: 1,
        },
        top_p: {
            type: 'number',
            maximum: 1,
        },
        frequency_penalty: {
            type: 'number',
            maximum: 2,
        },
        presence_penalty: {
            type: 'number',
            maximum: 2,
        },
        target_entities: {
            type: 'array',
            contains: {
                type: 'LLMTargetEntity',
            },
        },
        update_constraints: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        format: {
            type: 'Enum',
        },
        user_intent: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
    },
} as const;
