import { Spinner, HStack, Box } from "@chakra-ui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import DocsLayout from "@/crackmode/components/DocsLayout";
import Sidebar from "@/crackmode/components/Sidebar";
import CrackModeHeader from "@/crackmode/components/CrackModeHeader"
import DocumentSEOHead from "@/seo/DocumentSEOHead";
import { getDocumentFromPath, getBreadcrumbItems, getHeadings } from "@/crackmode/hooks/server-data";
import { useDocumentFromPath } from "@/crackmode/hooks/useDocumentFromPath";
import { useBreadcrumbItems } from "@/crackmode/hooks/useBreadcrumbItems";
import { useHeadings } from "@/crackmode/hooks/useHeading";
import { type EnhancedSearchableDoc } from "@/crackmode/types/search";
import { type BreadcrumbItem, type HeadingData } from "@/crackmode/types/docs";

// Server-side data fetching function
export async function getServerData(pathname: string, origin: string): Promise<{
  doc: EnhancedSearchableDoc | undefined;
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  baseUrl: string;
  headings: HeadingData[];
}> {
  // Use server-side functions instead of hooks
  const doc = getDocumentFromPath(pathname);
  const { structuredDataItems: breadcrumbs } = getBreadcrumbItems(pathname);
  const headings = getHeadings(doc);

  console.log("Server data - docs:", doc);
  console.log("Server data - breadcrumbs:", breadcrumbs);
  console.log("Server data - headings:", headings);

  return {
    doc,
    breadcrumbs,
    headings,
    currentPath: pathname,
    baseUrl: origin
  };
}

function DocsRouteComponent() {
  const borderColor = { base: 'gray.200', _dark: 'gray.700' };
  const loaderData = Route.useLoaderData();
  const isClient = typeof window !== 'undefined';

  // Client-side hooks
  const clientDoc = useDocumentFromPath();
  const clientBreadcrumbData = useBreadcrumbItems();
  const clientHeadings = useHeadings();

  // Server-side data
  const serverDoc = loaderData?.doc;
  const serverBreadcrumbs = loaderData?.breadcrumbs || [];
  const serverHeadings = loaderData?.headings || [];

  // Choose between server data (SSR) and client hooks (CSR)
  const doc = isClient ? clientDoc : serverDoc;
  const breadcrumbs = isClient ? clientBreadcrumbData.structuredDataItems : serverBreadcrumbs;
  const headings = isClient ? clientHeadings : serverHeadings;
  const currentPath = isClient ? window.location.pathname : loaderData?.currentPath;
  const baseUrl = isClient ? window.location.origin : loaderData?.baseUrl;

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
          <DocsLayout headings={headings}>
            <Outlet />
          </DocsLayout>
        </Suspense>
      </HStack>
    </Box>
  );
}

export const Route = createFileRoute("/crackmode/docs")({
  component: DocsRouteComponent,
  // loader for server-side data
  loader: async ({ location, context }) => {
    const isClient = typeof window !== 'undefined';

    // On client, return minimal data - hooks will handle the rest
    if (isClient) {
      return {
        doc: undefined,
        breadcrumbs: [],
        headings: [],
        currentPath: location.pathname,
        baseUrl: window.location.origin
      };
    }

    // Server-side: fetch full data
    const pathname = location.pathname;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origin = (context as any)?.req?.headers?.origin || (context as any)?.req?.headers?.host || 'https://frontend-production-a85f.up.railway.app';

    try {
      return await getServerData(pathname, origin);
    } catch (error) {
      console.error('Failed to fetch server data:', error);
      // Return fallback data
      return {
        doc: undefined,
        breadcrumbs: [],
        headings: [],
        currentPath: pathname,
        baseUrl: origin
      };
    }
  }
});