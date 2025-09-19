import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import TwoSum from "@/crackmode/docs/problems/two-sum.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/two-sum")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <TwoSum />
    </Suspense>
  ),
});