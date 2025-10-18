import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ProfilePage from "@/pages/ProfilePage";
// import { fetchCurrentUser } from "@/hooks/auth/useAuthQuery";
import { requireProfileCompletion } from "@/utils/routeGuards";

export const Route = createFileRoute("/_layout/dashboard/profile")({
  loader: async ({ location }) => {
    await requireProfileCompletion(location)
    return { requiresAuth: true };
  },
  beforeLoad: async ({ location }) => {
    await requireProfileCompletion(location)
  },
  validateSearch: (search) => ({
    drawer: search.drawer ?? undefined,
    step: search.step as string | undefined,
  }),
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ProfilePage />
    </Suspense>
  ),

  // meta: { requiresAuth: true },
});