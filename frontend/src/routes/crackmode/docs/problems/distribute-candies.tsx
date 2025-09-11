import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import DistributeCandies from "@/crackmode/docs/problems/distribute-candies.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/distribute-candies")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <DistributeCandies />
    </Suspense>
  ),
});