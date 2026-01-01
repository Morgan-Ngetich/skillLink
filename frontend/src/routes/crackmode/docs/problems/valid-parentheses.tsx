import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyValidParentheses= lazy(() => import("@/crackmode/docs/problems/valid-parentheses.mdx"));

function ValidParentheses() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyValidParentheses />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/valid-parentheses")({
  component: ValidParentheses,
});