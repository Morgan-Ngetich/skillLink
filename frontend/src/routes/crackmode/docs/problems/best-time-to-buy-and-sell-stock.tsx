import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyBestTimeToBuyAndSellStock = lazy(() => import("@/crackmode/docs/problems/best-time-to-buy-and-sell-stock.mdx"));

function BestTimeToBuyAndSellStock() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyBestTimeToBuyAndSellStock />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/best-time-to-buy-and-sell-stock")({
  component: BestTimeToBuyAndSellStock,
});