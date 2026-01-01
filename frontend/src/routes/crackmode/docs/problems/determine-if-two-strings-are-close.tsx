import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyDetermineIfTwoStringsAreClose= lazy(() => import("@/crackmode/docs/problems/determine-if-two-strings-are-close.mdx"));

function DetermineIfTwoStringsAreClose() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyDetermineIfTwoStringsAreClose />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/determine-if-two-strings-are-close")({
  component: DetermineIfTwoStringsAreClose,
});