import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import GcdOfStrings from "@/crackmode/docs/leetcode75/arraysStrings/gcd-of-strings.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/gcd-of-strings")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <GcdOfStrings />
    </Suspense>
  )
});