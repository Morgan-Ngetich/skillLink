import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import HomePage from "@/pages/HomePage";

export const Route = createFileRoute("/_layout/")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <HomePage />
    </Suspense>
  ),
});