import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyImplementStacksUsingQueues= lazy(() => import("@/crackmode/docs/problems/implement-stack-using-queues.mdx"));

function ImplementStacksUsingQueues() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyImplementStacksUsingQueues />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/implement-stack-using-queues")({
  component: ImplementStacksUsingQueues,
});