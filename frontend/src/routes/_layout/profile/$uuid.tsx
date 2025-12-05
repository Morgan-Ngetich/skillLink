import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ProfilePage from "@/pages/ProfilePage";
import { requireOwnerProfileCompletion } from "@/utils/routeGuards";

export interface ProfileSearchParams {
  pt?: string; // profileTab
  st?: string; // sidebarTab
  drawer?: string;
  step?: string;
  redirectTo?: string;
  serviceModal?: "create" | "edit";
  serviceId?: string;
  sessionModal?: "create" | "edit";
  sessionId?: string;
  sessionDetailId?: string;
  settings?: "open";
}

export const Route = createFileRoute("/_layout/profile/$uuid")({
  // Only check profile completion if the user is viewing their own profile
  beforeLoad: async ({ params, location }) => {
    await requireOwnerProfileCompletion(params.uuid, location);
  },
  validateSearch: (search: Record<string, unknown>): ProfileSearchParams => ({
    pt: (search.pt as string) ?? 'about',
    st: (search.st as string) ?? 'services',
    drawer: search.drawer as string | undefined,
    step: search.step as string | undefined,
    redirectTo: search.redirectTo as string | undefined,
    // Service modal params
    serviceModal: (search.serviceModal as "create" | "edit" | undefined) ?? undefined,
    serviceId: (search.serviceId as string | undefined) ?? undefined,
    // Session modal params
    sessionModal: search.sessionModal as "create" | "edit" | undefined,
    sessionId: search.sessionId as string | undefined,
    sessionDetailId: search.sessionDetailId as string | undefined, 
    // Settings dialog
    settings: search.settings as "open" | undefined,
  }),
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ProfilePage />
    </Suspense>
  ),
});