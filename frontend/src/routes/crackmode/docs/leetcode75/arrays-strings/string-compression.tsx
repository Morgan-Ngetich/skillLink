import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyStringCompression = lazy(() => import("@/crackmode/docs/leetcode75/arrays-strings/string-compression.mdx"));

function StringCompression() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyStringCompression />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/string-compression")({
  component: StringCompression,
});