import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyMissingNumber= lazy(() => import("@/crackmode/docs/problems/missing-number.mdx"));

function MissingNumber() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyMissingNumber />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/missing-number")({
  component: MissingNumber,
});