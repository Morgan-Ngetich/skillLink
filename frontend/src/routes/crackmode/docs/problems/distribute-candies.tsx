import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyDistributeCandies= lazy(() => import("@/crackmode/docs/problems/distribute-candies.mdx"));

function DistributeCandies() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyDistributeCandies />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/distribute-candies")({
  component: DistributeCandies,
});