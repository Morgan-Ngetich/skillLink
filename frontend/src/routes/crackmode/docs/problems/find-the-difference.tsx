import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyFindTheDifference= lazy(() => import("@/crackmode/docs/problems/find-the-difference.mdx"));

function FindTheDifference() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyFindTheDifference />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/find-the-difference")({
  component: FindTheDifference,
});