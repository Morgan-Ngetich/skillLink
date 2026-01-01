import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyGcdOfStrings = lazy(() => import("@/crackmode/docs/introduction.mdx"));

function GcdOfStrings() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyGcdOfStrings />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/gcd-of-strings")({
  component: GcdOfStrings,
});