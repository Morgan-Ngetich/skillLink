import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyMostCommonWord= lazy(() => import("@/crackmode/docs/problems/most-common-word.mdx"));

function MostCommonWord() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyMostCommonWord />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/most-common-word")({
  component: MostCommonWord,
});