import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyTwoSum= lazy(() => import("@/crackmode/docs/problems/two-sum.mdx"));

function TwoSum() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyTwoSum />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/two-sum")({
  component: TwoSum,
});