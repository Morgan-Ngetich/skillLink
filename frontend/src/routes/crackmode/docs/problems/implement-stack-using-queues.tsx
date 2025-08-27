import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ImplementStacksUsingQueues from "@/crackmode/docs/problems/implement-stack-using-queues.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/implement-stack-using-queues")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ImplementStacksUsingQueues />
    </Suspense>
  ),
});