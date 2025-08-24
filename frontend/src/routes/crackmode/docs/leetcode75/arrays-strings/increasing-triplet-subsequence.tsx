import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import IncreasingTripletSubsequence from "@/crackmode/docs/leetcode75/arraysStrings/increasing-triplet-subsequence.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/increasing-triplet-subsequence")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <IncreasingTripletSubsequence />
    </Suspense>
  ),
});