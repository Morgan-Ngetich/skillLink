import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import FindTheDifferenceOfTwoArrays from "@/crackmode/docs/problems/find-the-difference-of-two-arrays.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/find-the-difference-of-two-arrays")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <FindTheDifferenceOfTwoArrays />
    </Suspense>
  ),
});