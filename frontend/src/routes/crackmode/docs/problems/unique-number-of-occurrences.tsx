import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import UniqueNumberOfOccurrences from "@/crackmode/docs/problems/unique-number-of-occurrences.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/unique-number-of-occurrences")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <UniqueNumberOfOccurrences />
    </Suspense>
  ),
});