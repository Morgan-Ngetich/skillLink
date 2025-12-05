import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ProfileSetup from "@/components/profile/profileSetup/Index";


export const Route = createFileRoute("/_layout/profile-setup")({
  validateSearch: (search) => {
    const step = Number(search.step ?? 1);
    return {
      step: isNaN(step) || step < 1 ? 1 : step,
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
