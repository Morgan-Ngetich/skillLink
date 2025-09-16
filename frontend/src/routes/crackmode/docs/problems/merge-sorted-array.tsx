import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import MergeSortedArray from "@/crackmode/docs/problems/merge-sorted-array.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/merge-sorted-array")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <MergeSortedArray />
    </Suspense>
  ),
});