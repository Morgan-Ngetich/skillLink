import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ValidParentheses from "@/crackmode/docs/problems/valid-parentheses.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/valid-parentheses")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ValidParentheses />
    </Suspense>
  ),
});