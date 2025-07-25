import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ExplorePage from "@/pages/ExplorePage";

export const Route = createFileRoute("/_layout/explore")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ExplorePage />
    </Suspense>
  ),
});
