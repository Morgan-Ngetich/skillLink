import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  useBreakpointValue,
  Flex
} from "@chakra-ui/react";
import { Stat, Progress, Avatar } from "../ui";
import { FaEye, FaCalendarAlt } from "react-icons/fa";
import { FaArrowTrendUp, FaBookmark, FaClock } from "react-icons/fa6";

const GrowthStats = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardPadding = useBreakpointValue({ base: 3, md: 4 });
  const fontSize = useBreakpointValue({ base: "sm", md: "md" });

  return (
    <Box
      p={cardPadding}
      rounded="xl"
      border="1px solid"
      borderColor={"gray"}
      shadow="sm"
      // bg={{ base: 'white', _dark: 'gray.800' }}
      // maxW={{ base: "100%", md: "320px" }}
      w="100%"
      h={{base: "100%", md: "fit"}}
    >
      {/* Header - Compact */}
      <HStack justify="space-between" align="center" mb={3}>
        <Text fontSize={fontSize} fontWeight="bold">
          Activity
        </Text>
        <Badge
          colorPalette="green"
          variant="surface"
          fontSize="2xs"
          px={2}
          py={0.5}
          borderRadius="full"
        >
          +18%
        </Badge>
      </HStack>

      {/* Compact Stats Row */}
      <HStack justify="space-between" mb={3} px={5}>
        {/* Profile Views */}
        <VStack align="start" gap={0} flex={1} >
          <HStack gap={1} color="gray.500">
            <FaEye size={12} />
            <Text fontSize="2xs" fontWeight="medium">
              Views
            </Text>
          </HStack>
          <Text fontSize="lg" fontWeight="bold">
            214
          </Text>
        </VStack>

        {/* Sessions */}
        <VStack align="center" gap={0} flex={1}>
          <HStack gap={1} color="gray.500">
            <FaArrowTrendUp size={12} />
            <Text fontSize="2xs" fontWeight="medium">
              Sessions
            </Text>
          </HStack>
          <Text fontSize="lg" fontWeight="bold">
            12
          </Text>
        </VStack>

        {/* Rating */}
        <VStack align="end" gap={0} flex={1}>
          <Text fontSize="2xs" fontWeight="medium" color="gray.500">
            Rating
          </Text>
          <HStack gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="orange.500">
              4.9
            </Text>
            <Text fontSize="xs" color="orange.400">★</Text>
          </HStack>
        </VStack>
      </HStack>

      {/* Progress Bar - Compact */}
      {/* <Box mb={3}>
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="xs" fontWeight="medium">
            Monthly Goal
          </Text>
          <Text fontSize="xs" color="gray.500">
            12/20
          </Text>
        </Flex>
        <Progress 
          value={60} 
          colorPalette="purple" 
          size="xs"
          borderRadius="full"
        />
      </Box> */}

      <Box
        bg={"bg.emphasized"}
        borderRadius="lg"
        border="1px solid"
        borderColor={"gray"}
        mb={3}
        p={4}
      >
        <HStack gap={3} mb={3}>
          <Box
            p={2}
            bg="cardbg"
            borderRadius="lg"
          >
            <FaCalendarAlt size={16} />
          </Box>
          <VStack align="start" gap={0} flex={1}>
            <Text fontSize="sm" fontWeight="bold">
              Next Session
            </Text>
            <Text fontSize="xs" color="fg.muted">
              Starting in 2 hours
            </Text>
          </VStack>
          <Badge colorPalette="purple" variant="surface" fontSize="xs">
            Confirmed
          </Badge>
        </HStack>
        <VStack
          gap={0}
          w="full"
          mx="auto"
        >
          <Box>
            <Text fontSize="sm" fontWeight="semibold">
              Breaking into Tech Career
            </Text>
            <HStack gap={2} fontSize="xs" color="fg.muted">
              <HStack>
                <Avatar src={`https://i.pravatar.cc/50?img=${1}`} size="2xs" border={"1px solid"} />
                <Text>Sarah Mento</Text>
              </HStack>
              <Text>•</Text>
              <HStack gap={1}>
                <FaClock />
                <Text>Thursday, 4:00 PM</Text>
              </HStack>
              <Text>•</Text>
              <Text>60 min</Text>
            </HStack>
          </Box>
        </VStack>
      </Box>



      {/* Single Action Button */}
      <Flex mx="auto" mt={{base: 6, md: 2}}>
        <Button
          width="80%"
          size="sm"
          mx="auto"
          borderRadius="lg"
          fontWeight="medium"
          fontSize="xs"
          _hover={{
            transform: 'translateY(-1px)',
            shadow: 'md',
          }}
          transition="all 0.2s ease"
        >
          View Details
        </Button>
      </Flex>
    </Box>
  );
};

export default GrowthStats;