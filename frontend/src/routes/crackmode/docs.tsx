import { Spinner, HStack } from "@chakra-ui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import DocsLayout from "@/crackmode/components/DocsLayout";
import { useHeadings } from "@/crackmode/hooks/useHeading";
import Sidebar from "@/crackmode/components/Sidebar";

function DocsRouteComponent() {
  const headings = useHeadings();

  return (
    <HStack align="start" gap={0} w="100%">
      {/* Sidebar */}
      <Sidebar />
      <Suspense fallback={<Spinner />}>
        {/* Main Docs Content */}
        <DocsLayout headings={headings}>
          <Outlet /> {/* child docs pages will render here */}
        </DocsLayout>
      </Suspense>
    </HStack>
  );
}

export const Route = createFileRoute("/crackmode/docs")({
  component: DocsRouteComponent,
});
