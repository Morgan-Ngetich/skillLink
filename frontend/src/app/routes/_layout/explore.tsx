import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load the MDX component
const LazyExplorePage = lazy(() => import("@/pages/ExplorePage"));

export interface ExploreSearchParams {
  q?: string;
  view?: "mentors" | "sessions" | "services";
  sessionId?: string;
  serviceId?: string;
}

function ExplorePage() {
  return (
      <LazyExplorePage />
  );
}

export const Route = createFileRoute("/_layout/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearchParams => ({
    q: search.q as string | undefined,
    view: search.view as "mentors" | "sessions" | "services" | undefined,
    sessionId: search.sessionId as string | undefined,
    serviceId: search.serviceId as string | undefined,
  }),
  component: ExplorePage,
});
