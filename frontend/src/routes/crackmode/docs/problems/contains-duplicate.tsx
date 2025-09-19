import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ContainsDuplicate from "@/crackmode/docs/problems/contains-duplicate.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/contains-duplicate")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ContainsDuplicate />
    </Suspense>
  ),
});