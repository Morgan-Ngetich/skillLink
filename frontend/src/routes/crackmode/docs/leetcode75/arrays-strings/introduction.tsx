import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ArraysStrings from "@/crackmode/docs/leetcode75/arraysStrings/intro.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/introduction")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ArraysStrings />
    </Suspense>
  ),
});