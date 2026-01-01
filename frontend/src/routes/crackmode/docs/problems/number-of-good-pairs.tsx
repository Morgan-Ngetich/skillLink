import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyNumberOfGoodPairs= lazy(() => import("@/crackmode/docs/problems/number-of-good-pairs.mdx"));

function NumberOfGoodPairs() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyNumberOfGoodPairs />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/number-of-good-pairs")({
  component: NumberOfGoodPairs,
});