import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import NumberOfGoodPairs from "@/crackmode/docs/problems/number-of-good-pairs.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/number-of-good-pairs")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <NumberOfGoodPairs />
    </Suspense>
  ),
});