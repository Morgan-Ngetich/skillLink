/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoadmapStatus } from './RoadmapStatus';
import type { RoadmapVisibility } from './RoadmapVisibility';
export type Roadmap = {
    title: string;
    description?: (string | null);
    visibility?: RoadmapVisibility;
    status?: RoadmapStatus;
    tags: (Array<string> | null);
    start_date?: (string | null);
    target_date?: (string | null);
    id?: (number | null);
    owner_id: number;
    is_llm_generated?: boolean;
    created_at?: string;
    updated_at?: string;
};

