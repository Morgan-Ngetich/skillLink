import { Drawer, Portal, Flex, Text, Button, IconButton, VStack } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { MentorFilters } from "./filters/MentorFilters";
import { SessionFilters } from "./filters/SessionFilters";
import { ServiceFilters } from "./filters/ServiceFilters";
import type { ViewType } from "./types";
import type { UseExploreFiltersReturn } from "@/hooks/explore/useExploreFilters";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  filters: UseExploreFiltersReturn;
  resultCounts: {
    mentors: number;
    sessions: number;
    services: number;
  };
}

export const FilterDrawer = ({
  isOpen,
  onClose,
  currentView,
  filters,
  resultCounts,
}: FilterDrawerProps) => {
  const hasActiveFilters = filters.getActiveFilterCount(currentView) > 0;

  const getResultText = () => {
    const count = resultCounts[currentView];
    const label = currentView === "mentors" 
      ? count === 1 ? "mentor" : "mentors"
      : currentView === "sessions"
      ? count === 1 ? "session" : "sessions"
      : count === 1 ? "service" : "services";
    return `${count} ${label}`;
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      placement={{ base: "bottom", md: "end" }}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="xl"
            maxH={{ base: "90vh", md: "100vh" }}
            display="flex"
            flexDirection="column"
          >
            <Drawer.Header borderBottom="1px solid" borderColor="border" py={4} px={6}>
              <Flex justify="space-between" align="center" w="100%">
                <IconButton
                  aria-label="Close"
                  variant="surface"
                  onClick={onClose}
                  size="sm"
                  borderRadius="full"
                >
                  <LuX />
                </IconButton>
                <Text fontSize="lg" fontWeight="semibold">
                  Filters
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={filters.clearAll}
                  disabled={!hasActiveFilters}
                >
                  Clear all
                </Button>
              </Flex>
            </Drawer.Header>

            <Drawer.Body flex="1" overflowY="auto" py={6} px={6}>
              <VStack align="stretch" gap={8}>
                {currentView === "mentors" && <MentorFilters filters={filters} />}
                {currentView === "sessions" && <SessionFilters filters={filters} />}
                {currentView === "services" && <ServiceFilters filters={filters} />}
              </VStack>
            </Drawer.Body>

            <Drawer.Footer borderTop="1px solid" borderColor="border" py={4} px={6}>
              <Flex gap={3} w="full">
                <Button
                  flex={1}
                  variant="outline"
                  onClick={filters.clearAll}
                  disabled={!hasActiveFilters}
                >
                  Clear all
                </Button>
                <Button flex={1} onClick={onClose}>
                  Show {getResultText()}
                </Button>
              </Flex>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};