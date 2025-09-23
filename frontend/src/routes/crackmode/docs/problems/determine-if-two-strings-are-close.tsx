import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import DetermineIfTwoStringsAreClose from "@/crackmode/docs/problems/determine-if-two-strings-are-close.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/determine-if-two-strings-are-close")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <DetermineIfTwoStringsAreClose />
    </Suspense>
  ),
});