import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import StringCompression from "@/crackmode/docs/leetcode75/arrays-strings/string-compression.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/string-compression")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <StringCompression />
    </Suspense>
  )
});