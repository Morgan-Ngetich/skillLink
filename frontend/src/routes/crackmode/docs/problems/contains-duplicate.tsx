import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyContainsDuplicate= lazy(() => import("@/crackmode/docs/problems/contains-duplicate.mdx"));

function ContainsDuplicate() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyContainsDuplicate />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/contains-duplicate")({
  component: ContainsDuplicate,
});