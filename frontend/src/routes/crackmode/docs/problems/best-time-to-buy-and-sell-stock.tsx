import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import BestTimeToBuyAndSellStock from "@/crackmode/docs/problems/best-time-to-buy-and-sell-stock.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/best-time-to-buy-and-sell-stock")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <BestTimeToBuyAndSellStock />
    </Suspense>
  ),
});