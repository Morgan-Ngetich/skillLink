/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OgService {
    /**
     * Get Og Profile
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getOgProfileApiV1OgProfileUuidGet({
        uuid,
    }: {
        uuid: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/og/profile/{uuid}',
            path: {
                'uuid': uuid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Session Og
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSessionOgApiV1OgSessionUuidGet({
        uuid,
    }: {
        uuid: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/og/session/{uuid}',
            path: {
                'uuid': uuid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
