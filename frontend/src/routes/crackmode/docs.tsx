import { Spinner, HStack, Box } from "@chakra-ui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import DocsLayout from "@/crackmode/components/DocsLayout";
import Sidebar from "@/crackmode/components/Sidebar";
import CrackModeHeader from "@/crackmode/components/CrackModeHeader"
import DocumentSEOHead from "@/seo/DocumentSEOHead";
import { getDocumentFromPath, getBreadcrumbItems } from "@/crackmode/hooks/server-data";
import { type EnhancedSearchableDoc } from "@/crackmode/types/search";
import { type BreadcrumbItem } from "@/crackmode/types/docs";

// Server-side data fetching function
export async function getServerData(url: string): Promise<{
  doc: EnhancedSearchableDoc | undefined;
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  baseUrl: string;
}> {
  // Extract path from URL
  const urlObj = new URL(url);
  const currentPath = urlObj.pathname;

  // Use server-side functions instead of hooks
  const doc = getDocumentFromPath(currentPath);
  const { structuredDataItems: breadcrumbs } = getBreadcrumbItems(currentPath);

  return {
    doc,
    breadcrumbs,
    currentPath,
    baseUrl: urlObj.origin
  };
}

function DocsRouteComponent() {
  const borderColor = { base: 'gray.200', _dark: 'gray.700' }
  const { doc, breadcrumbs, currentPath, baseUrl } = Route.useLoaderData();

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      <DocumentSEOHead
        doc={doc}
        breadcrumbs={breadcrumbs}
        currentPath={currentPath}
        baseUrl={baseUrl}
      />

      <CrackModeHeader page="crackmode/docs" />
      <HStack flex="1" align="start" gap={0} w="100%" overflow="hidden">
        {/* Sidebar */}
        <Box
          as="nav"
          w="280px"
          borderRight="1px solid"
          borderColor={borderColor}
          px={4}
          pt={8}
          display={{ base: "none", md: "block" }}
          position="sticky"
          top={0}
          h="100%"
          overflowY="auto"
        >
          <Sidebar />
        </Box>

        <Suspense fallback={<Spinner />}>
          {/* Main Docs Content */}
          <DocsLayout headings={[]}>
            <Outlet />
          </DocsLayout>
        </Suspense>
      </HStack>
    </Box>
  );
}

export const Route = createFileRoute("/crackmode/docs")({
  component: DocsRouteComponent,
  // Add loader for server-side data
  loader: async ({location}) => {
    return getServerData(location.href);
  }
});