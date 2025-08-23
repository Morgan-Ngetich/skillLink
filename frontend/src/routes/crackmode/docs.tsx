import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import DocsPage from "@/crackmode/DocsPage"

export const Route = createFileRoute("/crackmode/docs")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <DocsPage />
    </Suspense>
  ),
  // beforeLoad: async () => {
  //   if (await isLoggedIn()) {
  //     throw redirect({ to: "/" });
  //   }
  // }
});