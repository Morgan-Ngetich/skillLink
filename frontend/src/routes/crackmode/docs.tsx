import { Spinner, HStack, Box } from "@chakra-ui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import DocsLayout from "@/crackmode/components/DocsLayout";
import { useHeadings } from "@/crackmode/hooks/useHeading";
import Sidebar from "@/crackmode/components/Sidebar";
import Header from "@/crackmode/components/Header"
import { useColorModeValue } from "@/components/ui";

function DocsRouteComponent() {
  const headings = useHeadings();
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      <Header />
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
          top={0} // sticky relative to parent container
          h="100%" // fill height of HStack
          overflowY="auto"
        >
          <Sidebar />
        </Box>

        <Suspense fallback={<Spinner />}>
          {/* Main Docs Content */}
          <DocsLayout headings={headings}>
            <Outlet /> {/* child docs pages will render here */}
          </DocsLayout>
        </Suspense>
      </HStack>
    </Box>

  );
}

export const Route = createFileRoute("/crackmode/docs")({
  component: DocsRouteComponent,
});
