import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyArraysStrings = lazy(() => import("@/crackmode/docs/leetcode75/arrays-strings.mdx"));

function DocsIndex() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyArraysStrings />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/")({
  component: DocsIndex,
});