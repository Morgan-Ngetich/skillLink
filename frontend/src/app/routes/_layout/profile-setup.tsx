import { lazy } from 'react';
import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';

const ProfileSetup = lazy(() => import("@/components/profile/profileSetup/Index"));

export const Route = createFileRoute("/_layout/profile-setup")({
  validateSearch: (search) => {
    const stepParam = search.step;
    let step: number | undefined = undefined;
    
    if (stepParam !== undefined && stepParam !== null) {
      const stepNum = Number(stepParam);
      step = isNaN(stepNum) || stepNum < 1 ? 1 : stepNum;
    }
    
    return {
      step,
      redirectTo: (search.redirectTo as string | undefined) ?? undefined,
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