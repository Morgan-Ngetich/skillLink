import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import CheckIfNumberHasEqualDigitCountAndDigitValue from "@/crackmode/docs/problems/check-if-number-has-equal-digit-count-and-digit-value.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/check-if-number-has-equal-digit-count-and-digit-value")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <CheckIfNumberHasEqualDigitCountAndDigitValue />
    </Suspense>
  ),
});