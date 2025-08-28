import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import LongestConsecutiveSequence from "@/crackmode/docs/problems/longest-consecutive-sequence.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/longest-consecutive-sequence")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <LongestConsecutiveSequence />
    </Suspense>
  ),
});