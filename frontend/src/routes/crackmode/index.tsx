import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import Home from "@/crackmode/Home"

export const Route = createFileRoute("/crackmode/")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <Home />
    </Suspense>
  ),
  // beforeLoad: async () => {
  //   if (await isLoggedIn()) {
  //     throw redirect({ to: "/" });
  //   }
  // }
});