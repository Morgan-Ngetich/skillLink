import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import LongestPalindrome from "@/crackmode/docs/problems/longest-palindrome.mdx"

export const Route = createFileRoute("/crackmode/docs/problems/longest-palindrome")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <LongestPalindrome />
    </Suspense>
  ),
});