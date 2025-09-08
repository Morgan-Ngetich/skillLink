import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import FindAllDuplicatesInAnArray from "@/crackmode/docs/problems/find-all-duplicates-in-an-array.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/find-all-duplicates-in-an-array")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <FindAllDuplicatesInAnArray />
    </Suspense>
  ),
});