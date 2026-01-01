import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyProductOfArrayExceptSelf = lazy(() => import("@/crackmode/docs/leetcode75/arrays-strings/product-of-array-except-self.mdx"));

function ProductOfArrayExceptSelf() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyProductOfArrayExceptSelf />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/product-of-array-except-self")({
  component: ProductOfArrayExceptSelf,
});