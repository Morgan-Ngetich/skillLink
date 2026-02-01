import { lazy } from 'react';
import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';

const ProfileSetup = lazy(() => import("@/components/profile/profileSetup/Index"));

export const Route = createFileRoute("/_layout/profile-setup")({
  ssr: false,
  validateSearch: (search) => {
    const stepParam = search.step;
    let step: number | undefined = undefined;

    if (stepParam !== undefined && stepParam !== null) {
      const stepNum = Number(stepParam);
      step = isNaN(stepNum) || stepNum < 1 ? 1 : stepNum;
    }

    // Parse redirectSearch back to object
    let redirectSearch = {};
    if (search.redirectSearch && typeof search.redirectSearch === 'string') {
      try {
        redirectSearch = JSON.parse(search.redirectSearch);
      } catch (e) {
        console.error('Failed to parse redirectSearch', e);
      }
    }

    return {
      step,
      redirectTo: (search.redirectTo as string | undefined) ?? undefined,
      redirectSearch,
    };
  },
  loader: async () => {
    return { requiresAuth: true };
  },
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ProfileSetup />
    </Suspense>
  ),
});