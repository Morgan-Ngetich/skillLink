import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import NumberOf1Bits from "@/crackmode/docs/problems/number-of-1-bits.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/number-of-1-bits")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <NumberOf1Bits />
    </Suspense>
  ),
});