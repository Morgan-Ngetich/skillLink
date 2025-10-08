import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import MentorPage from "@/pages/MentorPage";

export const Route = createFileRoute("/_layout/mentor")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <MentorPage />
    </Suspense>
  ),
});