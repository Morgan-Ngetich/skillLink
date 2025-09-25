import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import AsteroidCollision from "@/crackmode/docs/problems/asteroid-collision.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/asteroid-collision")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <AsteroidCollision />
    </Suspense>
  ),
});