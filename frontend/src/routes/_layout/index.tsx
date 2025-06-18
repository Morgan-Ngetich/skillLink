import { Spinner } from "@chakra-ui/react";
import NotFound from "../../components/common/NotFound";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';

export const Route = createFileRoute("/_layout/")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <NotFound />
    </Suspense>
  ),
});