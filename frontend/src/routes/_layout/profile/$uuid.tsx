import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from 'react';
import { requireOwnerProfileCompletion } from "@/utils/routeGuards";
import { UsersService } from "@/client"; // Import the service directly
import ProfilePageSkeleton from "@/skeletons/profilPage/Index";

const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

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
    const result = await requireOwnerProfileCompletion(params.uuid, location);
    return result;
  },
  
  // Load public data directly (NOT using React hooks)
  loader: async ({ params }) => {
    // Call the API directly, not through React hook
    try {
      const publicData = await UsersService.getUserApiV1UsersIdentifierGet({ 
        identifier: params.uuid 
      });
      return { publicData };
    } catch (error) {
      console.error("Failed to load profile data:", error);
      // Return null or empty data, but don't crash
      return { publicData: null };
    }
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
  component: ProfileRouteComponent
});

function ProfileRouteComponent() {
  const { publicData } = Route.useLoaderData();
  
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePage initialPublicData={publicData} />
    </Suspense>
  );
}