import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import MostCommonWord from "@/crackmode/docs/problems/most-common-word.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/most-common-word")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <MostCommonWord />
    </Suspense>
  ),
});