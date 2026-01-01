import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyMergeStrings = lazy(() => import("@/crackmode/docs/leetcode75/arrays-strings/merge-strings-alternately.mdx"));

function MergeStrings() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyMergeStrings />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/merge-strings-alternately")({
  component: MergeStrings,
});