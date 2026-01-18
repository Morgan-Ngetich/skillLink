import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { z } from "zod"

// Lazy load the MDX component
const LazyExplorePage = lazy(() => import("@/pages/ExplorePage"));

function ExplorePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyExplorePage />
    </Suspense>
  );
}

export const Route = createFileRoute("/_layout/explore")({
  component: ExplorePage,
  validateSearch: z.object({
    q: z.string().optional(),
  }),
});
