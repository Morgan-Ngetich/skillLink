import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import MergeStrings from "@/crackmode/docs/leetcode75/arraysStrings/merge-strings-alternately.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/merge-strings-alternately")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <MergeStrings />
    </Suspense>
  )
});