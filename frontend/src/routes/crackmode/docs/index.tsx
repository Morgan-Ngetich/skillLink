// docs/index.tsx
import IntroDoc from "@/crackmode/docs/introduction.mdx";
import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

function DocsIndex() {
  return (
    <Suspense fallback={<Spinner />}>
      <IntroDoc />
    </Suspense>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route: any = createFileRoute("/crackmode/docs/")({
  component: DocsIndex,
});
