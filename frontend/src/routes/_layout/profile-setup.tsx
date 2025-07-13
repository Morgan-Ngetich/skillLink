import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import ProfileSetup from "@/components/profile/ProfileSetup";

export const Route = createFileRoute("/_layout/profile-setup")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <ProfileSetup />
    </Suspense>
  ),
});