import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import HomeMenteeDashboard from "@/pages/HomeMenteeDashboard";
// import { fetchCurrentUser } from "@/hooks/auth/useAuthQuery";
// import { requireProfileCompletion } from "@/utils/routeGuards";

export const Route = createFileRoute("/_layout/dashboard/")({
  // loader: async ({ location }) => {
  //   await requireProfileCompletion(location)
  //   return { requiresAuth: true };
  // },
  // beforeLoad: async ({ location }) => {
  //   await requireProfileCompletion(location)
  // },
  component: () => (
    <Suspense fallback={<Spinner />}>
      <HomeMenteeDashboard />
    </Suspense>
  ),

  // meta: { requiresAuth: true },
});