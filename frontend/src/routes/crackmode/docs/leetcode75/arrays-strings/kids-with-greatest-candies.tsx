import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyKidsWithGreatestCandies = lazy(() => import("@/crackmode/docs/leetcode75/arrays-strings/kids-with-greatest-candies.mdx"));

function KidsWithGreatestCandies() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyKidsWithGreatestCandies />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/kids-with-greatest-candies")({
  component: KidsWithGreatestCandies,
});