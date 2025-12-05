import { Flex, Heading, HStack, Text, IconButton, Button, Badge, Tabs } from "@chakra-ui/react";
import { LuFilter, LuX, LuUser, LuCalendar, LuBriefcase } from "react-icons/lu";
import type { ViewType } from "./types";

interface ExploreHeaderProps {
  searchQuery: string;
  currentView: ViewType;
  activeFilterCount: number;
  onClearSearch: () => void;
  onOpenFilters: () => void;
  onViewChange: (view: ViewType) => void;
}

export const ExploreHeader = ({
  searchQuery,
  currentView,
  activeFilterCount,
  onClearSearch,
  onOpenFilters,
  onViewChange,
}: ExploreHeaderProps) => {
  return (
    <>
      <Flex justify="space-between" align="center">
        <Heading size={{ base: "lg", md: "xl" }}>
          {searchQuery ? (
            <HStack gap={2}>
              <Text>"{searchQuery}"</Text>
              <IconButton
                aria-label="Clear search"
                size="2xs"
                variant="solid"
                onClick={onClearSearch}
                borderRadius="full"
              >
                <LuX />
              </IconButton>
            </HStack>
          ) : (
            "Explore"
          )}
        </Heading>

        <Button
          size={{ base: "sm", md: "md" }}
          variant="outline"
          onClick={onOpenFilters}
          borderRadius="full"
          px={4}
          position="relative"
        >
          <LuFilter />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              variant="solid"
              borderRadius="full"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </Flex>

      <Tabs.Root
        value={currentView}
        onValueChange={(e) => onViewChange(e.value as ViewType)}
        variant="plain"
      >
        <Tabs.List 
          borderBottom="1px solid" 
          borderColor="border" 
          w={{ base: "full", md: "max-content" }} 
          justifyContent="space-between"
        >
          <Tabs.Trigger value="mentors">
            <HStack gap={2}>
              <LuUser />
              <Text>Mentors</Text>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="sessions">
            <HStack gap={2}>
              <LuCalendar />
              <Text>Sessions</Text>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="services">
            <HStack gap={2}>
              <LuBriefcase />
              <Text>Services</Text>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.Root>
    </>
  );
};