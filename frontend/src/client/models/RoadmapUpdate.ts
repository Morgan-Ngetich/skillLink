/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoadmapStatus } from './RoadmapStatus';
import type { RoadmapVisibility } from './RoadmapVisibility';
export type RoadmapUpdate = {
    title?: (string | null);
    description?: (string | null);
    visibility?: (RoadmapVisibility | null);
    status?: (RoadmapStatus | null);
    tags?: (Array<string> | null);
    start_date?: (string | null);
    target_date?: (string | null);
};

