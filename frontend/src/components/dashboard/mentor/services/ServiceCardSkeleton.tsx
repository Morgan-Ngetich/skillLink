// src/components/dashboard/mentor/services/ServiceCardSkeleton.tsx
import { Box, VStack, HStack, Skeleton, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui";

export const ServiceCardSkeleton = () => {
  const borderCol = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderRadius="2xl"
      // bg={cardBg}
      borderColor={borderCol}
      overflow="hidden"
      shadow="sm"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Banner Image Skeleton */}
      <Skeleton
        h={{ base: "125px", md: "145px" }}
        w="full"
        flexShrink={0}
        borderRadius="none"
      />

      <VStack align="start" gap={3} px={{ base: 2, md: 3 }} py={3} flex={1}>
        {/* Title Skeleton */}
        <VStack align="start" gap={1} w="full">
          <Skeleton height="18px" width="85%" />
          <Skeleton height="18px" width="60%" display={{ base: "none", md: "block" }} />
        </VStack>

        {/* Description Skeleton */}
        <VStack align="start" gap={1} w="full">
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="95%" />
          <Skeleton height="14px" width="70%" />
        </VStack>

        {/* Highlights Skeleton */}
        <HStack wrap="nowrap" gap={2} w="full" overflow="hidden">
          <Skeleton height="20px" width="80px" borderRadius="md" />
          <Skeleton height="20px" width="100px" borderRadius="md" />
          <Skeleton height="20px" width="90px" borderRadius="md" />
        </HStack>

        {/* Bottom info Skeleton */}
        <Flex justify="space-between" w="full" align="center" mt="auto">
          <Skeleton height="24px" width="60px" />
          <Skeleton height="16px" width="50px" />
        </Flex>
      </VStack>
    </Box>
  );
};