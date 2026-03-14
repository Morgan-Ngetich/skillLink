import { Box, Flex, HStack, VStack, Skeleton, SkeletonText  } from "@chakra-ui/react";

interface SessionCardSkeletonProps {
  isSmall?: boolean;
}

const SessionCardSkeleton: React.FC<SessionCardSkeletonProps> = ({ isSmall = false }) => {
  return (
    <Box
      w="full"
      maxW="450px"
      h="full"
      position="relative"
      rounded="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="border.emphasized"
      bg="blackAlpha.300"
    >
      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.300" />

      <Flex
        position="relative"
        direction="column"
        h="full"
        px={{ base: 2, md: 3 }}
        py={1}
        zIndex={1}
      >
        {/* Header: Attendees + Date Badge + Menu */}
        <Flex justify="space-between" align="center" mb={4}>
          {/* Left - Avatar group */}
          <HStack gap={1}>
            <Skeleton rounded="full" w={isSmall ? "20px" : "24px"} h={isSmall ? "20px" : "24px"} />
            <Skeleton rounded="full" w={isSmall ? "20px" : "24px"} h={isSmall ? "20px" : "24px"} />
            <Skeleton rounded="full" w={isSmall ? "20px" : "24px"} h={isSmall ? "20px" : "24px"} />
          </HStack>

          {/* Right - Date badge */}
          <Skeleton h="28px" w="180px" rounded="md" />
        </Flex>

        {/* Spacer */}
        <Box flex={1} minH="15px" />

        {/* Mentor Info */}
        <Box mb={3}>
          <HStack gap={2} align="start" mb={isSmall ? 1 : 2}>
            <Skeleton
              rounded="full"
              w={isSmall ? "32px" : "45px"}
              h={isSmall ? "32px" : "45px"}
              flexShrink={0}
            />
            <VStack align="start" gap={1} flex={1}>
              <Skeleton h="14px" w="120px" rounded="sm" />
              <Skeleton h="10px" w="80px" rounded="sm" />
            </VStack>
          </HStack>

          {/* Title */}
          <HStack justify="space-between" align="start" gap={2} mb={2}>
            <SkeletonText
              noOfLines={isSmall ? 1 : 2}
              gap={1}
              flex={1}
            />
            <Skeleton h="20px" w="60px" rounded="full" />
          </HStack>
        </Box>

        {/* Booking Section */}
        <Box
          bg="whiteAlpha.900"
          _dark={{ bg: "blackAlpha.800" }}
          py={isSmall ? 1 : 2}
          px={3}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.300"
        >
          <Skeleton h="10px" w="100px" mb={2} rounded="sm" />

          <Flex justify="space-between" align="center">
            <Box flex={1}>
              <Skeleton h="22px" w="80px" mb={1} rounded="sm" />
              <Skeleton h="10px" w="60px" rounded="sm" />
            </Box>

            <VStack align="end" gap={2}>
              <Skeleton h="14px" w="80px" rounded="sm" />
              <Skeleton
                h={isSmall ? "24px" : "32px"}
                w={isSmall ? "80px" : "100px"}
                rounded="full"
              />
            </VStack>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default SessionCardSkeleton;