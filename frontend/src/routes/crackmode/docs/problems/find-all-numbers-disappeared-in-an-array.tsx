import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import FindAllNumbersDisappearedInArray from "@/crackmode/docs/problems/find-all-numbers-disappeared-in-an-array.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/find-all-numbers-disappeared-in-an-array")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <FindAllNumbersDisappearedInArray />
    </Suspense>
  ),
});