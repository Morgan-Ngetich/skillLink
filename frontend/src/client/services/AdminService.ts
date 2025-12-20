/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleAssignRequest } from '../models/RoleAssignRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Assign Role
     * Assign role to user (admin only)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static assignRoleApiV1AdminRolesAssignPost({
        requestBody,
    }: {
        requestBody: RoleAssignRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/roles/assign',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
