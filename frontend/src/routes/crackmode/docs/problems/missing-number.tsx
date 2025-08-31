import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import MissingNumber from "@/crackmode/docs/problems/missing-number.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/missing-number")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <MissingNumber />
    </Suspense>
  ),
});