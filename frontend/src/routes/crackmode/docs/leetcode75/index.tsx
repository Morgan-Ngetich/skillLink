import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import Leetcode75 from "@/crackmode/docs/leetcode75/leetcode75.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <Leetcode75 />
    </Suspense>
  )
});