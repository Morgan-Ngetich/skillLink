import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import KidsWithGreatestCandies from "@/crackmode/docs/leetcode75/arrays-strings/kids-with-greatest-candies.mdx"

export const Route = createFileRoute("/crackmode/docs/leetcode75/arrays-strings/kids-with-greatest-candies")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <KidsWithGreatestCandies />
    </Suspense>
  )
});