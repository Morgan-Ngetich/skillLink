import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ProductOfArrayExceptSelf from "@/crackmode/docs/leetcode75/arraysStrings/product-of-array-except-self.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/product-of-array-except-self")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ProductOfArrayExceptSelf />
    </Suspense>
  )
});