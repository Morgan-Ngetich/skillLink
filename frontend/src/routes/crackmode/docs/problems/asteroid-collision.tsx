import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyAsteroidCollision = lazy(() => import("@/crackmode/docs/problems/asteroid-collision.mdx"));

function AsteroidCollision() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyAsteroidCollision />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/asteroid-collision")({
  component: AsteroidCollision,
});