/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TaskStatus = {
    description: `Task status for async LLM operations`,
    properties: {
        task_id: {
            type: 'string',
            isRequired: true,
        },
        status: {
            type: 'TaskStatusEnum',
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
        result: {
            type: 'any-of',
            contains: [{
                type: 'LLMGenerationResponse',
            }, {
                type: 'null',
            }],
        },
    },
} as const;
