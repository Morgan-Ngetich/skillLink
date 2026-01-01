import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyFindTheDifferenceOfTwoArrays= lazy(() => import("@/crackmode/docs/problems/find-the-difference-of-two-arrays.mdx"));

function FindTheDifferenceOfTwoArrays() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyFindTheDifferenceOfTwoArrays />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/find-the-difference-of-two-arrays")({
  component: FindTheDifferenceOfTwoArrays,
});