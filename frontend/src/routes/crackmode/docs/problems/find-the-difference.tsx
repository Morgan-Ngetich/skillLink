import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import FindTheDifference from "@/crackmode/docs/problems/find-the-difference.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/find-the-difference")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <FindTheDifference />
    </Suspense>
  ),
});