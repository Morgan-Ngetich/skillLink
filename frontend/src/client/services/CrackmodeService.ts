/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CrackmodeService {
    /**
     * Generate Og Image
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateOgImageApiV1OgGet({
        title,
        description = 'Master algorithms with CrackMode',
        section = 'Documentation',
        theme = 'crackmode',
    }: {
        /**
         * Title for the OG image
         */
        title: string,
        /**
         * Description text
         */
        description?: string,
        /**
         * Section name
         */
        section?: string,
        /**
         * Theme name
         */
        theme?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/og',
            query: {
                'title': title,
                'description': description,
                'section': section,
                'theme': theme,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
