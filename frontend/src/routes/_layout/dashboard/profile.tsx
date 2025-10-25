import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ProfilePage from "@/pages/ProfilePage";
import { requireProfileCompletion } from "@/utils/routeGuards";


export interface ProfileSearchParams {
  profileTab?: string;
  sidebarTab?: string;
  drawer?: string;
  step?: string;
  redirectTo?: string;
  serviceModal?: "create" | "edit";
  serviceId?: string;
}

export const Route = createFileRoute("/_layout/dashboard/profile")({
  loader: async ({ location }) => {
    await requireProfileCompletion(location)
    return { requiresAuth: true };
  },
  beforeLoad: async ({ location }) => {
    await requireProfileCompletion(location)
  },
  validateSearch: (search: Record<string, unknown>): ProfileSearchParams => ({
    profileTab: (search.profileTab as string) ?? 'about',
    sidebarTab: (search.sidebarTab as string) ?? 'services',
    drawer: search.drawer as string | undefined,
    step: search.step as string | undefined,
    redirectTo: search.redirectTo as string | undefined,
    // Service modal params
    serviceModal: (search.serviceModal as "create" | "edit" | undefined) ?? undefined,
    serviceId: (search.serviceId as string | undefined) ?? undefined,
  }),
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ProfilePage />
    </Suspense>
  ),
});