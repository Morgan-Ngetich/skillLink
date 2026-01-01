import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyUniqueNumberOfOccurrences= lazy(() => import("@/crackmode/docs/problems/unique-number-of-occurrences.mdx"));

function UniqueNumberOfOccurrences() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyUniqueNumberOfOccurrences />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/unique-number-of-occurrences")({
  component: UniqueNumberOfOccurrences,
});