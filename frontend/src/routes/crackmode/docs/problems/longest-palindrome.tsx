import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy load the MDX component
const LazyLongestPalindrome= lazy(() => import("@/crackmode/docs/problems/longest-palindrome.mdx"));

function LongestPalindrome() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyLongestPalindrome />
    </Suspense>
  );
}

export const Route = createFileRoute("/crackmode/docs/problems/longest-palindrome")({
  component: LongestPalindrome,
});