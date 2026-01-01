import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyNumberOf1Bits= lazy(() => import("@/crackmode/docs/problems/number-of-1-bits.mdx"));

function NumberOf1Bits() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyNumberOf1Bits />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/number-of-1-bits")({
  component: NumberOf1Bits,
});