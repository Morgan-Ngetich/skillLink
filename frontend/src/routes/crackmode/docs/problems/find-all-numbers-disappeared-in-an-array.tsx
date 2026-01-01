import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyFindAllNumbersDisappearedInArray= lazy(() => import("@/crackmode/docs/problems/find-all-numbers-disappeared-in-an-array.mdx"));

function FindAllNumbersDisappearedInArray() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyFindAllNumbersDisappearedInArray />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/find-all-numbers-disappeared-in-an-array")({
  component: FindAllNumbersDisappearedInArray,
});