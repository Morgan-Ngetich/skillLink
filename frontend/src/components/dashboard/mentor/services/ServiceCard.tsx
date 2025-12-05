import {
  Box,
  VStack,
  Text,
  Heading,
  Badge,
  HStack,
  Flex,
  Image,
  Menu,
  IconButton,
} from "@chakra-ui/react";
import { useColorModeValue, Tooltip } from "@/components/ui";
import { LuClock4, LuTrash2, LuPencil } from "react-icons/lu";
import { FaCoins } from "react-icons/fa6";
import type { MentorServicePublic } from "@/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

interface ServiceCardProps {
  service: MentorServicePublic;
  onEdit?: (service: MentorServicePublic) => void;
  onDelete?: (service: MentorServicePublic) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showActions?: boolean
}

const ServiceCard = ({
  service,
  onEdit,
  onDelete,
  isExpanded = false,
  onToggleExpand,
  showActions = true // prop from readOnly or !readOnly
}: ServiceCardProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.700");

  const containerRef = useRef<HTMLDivElement>(null);
  const safeHighlights = useMemo(
    () => service.highlights ?? [],
    [service.highlights]
  );
  const [visibleCount, setVisibleCount] = useState(safeHighlights.length);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Measure visible badges that fit in one row (only when collapsed)
  useEffect(() => {
    if (isExpanded || safeHighlights.length === 0) return;

    const measureVisibleBadges = () => {
      const container = containerRef.current;
      if (!container) return;

      // Temporarily show all badges to measure
      const badges = Array.from(container.querySelectorAll('[data-badge]')) as HTMLElement[];
      if (badges.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const firstBadgeTop = badges[0].getBoundingClientRect().top;

      let count = 0;
      let totalWidth = 0;
      const gap = 8; // HStack gap in pixels

      for (let i = 0; i < badges.length; i++) {
        const badgeWidth = badges[i].getBoundingClientRect().width;
        const badgeTop = badges[i].getBoundingClientRect().top;

        // Check if badge wraps to next line
        if (Math.abs(badgeTop - firstBadgeTop) > 2) {
          break;
        }

        totalWidth += badgeWidth + (i > 0 ? gap : 0);

        // Leave space for "+X more" text (approximately 60px)
        if (totalWidth + 60 < containerRect.width || i === badges.length - 1) {
          count = i + 1;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, count));
    };

    // Delay measurement to ensure DOM is ready
    const timer = setTimeout(measureVisibleBadges, 50);

    // Re-measure on window resize
    window.addEventListener('resize', measureVisibleBadges);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureVisibleBadges);
    };
  }, [safeHighlights.length, isExpanded]);

  // Handle card interaction
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (isMobile && onToggleExpand) {
      onToggleExpand();
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && onToggleExpand) {
      onToggleExpand();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && onToggleExpand && isExpanded) {
      onToggleExpand();
    }
  };

  // Get hidden highlights for tooltip
  const displayedHighlights = isExpanded ? safeHighlights : safeHighlights.slice(0, visibleCount);
  const hiddenHighlights = safeHighlights.slice(visibleCount);

  return (
    <Box
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      position="relative"
      borderWidth="1px"
      borderRadius="2xl"
      bg={cardBg}
      borderColor={borderCol}
      overflow="hidden"
      shadow="sm"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      cursor={isMobile ? "pointer" : "default"}
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
        borderColor: "border.muted",
      }}
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Banner Image */}
      {service.banner_url && (
        <Box
          h={{ base: "125px", md: "150px" }}
          overflow="hidden"
          bg="gray.subtle"
          position="relative"
          flexShrink={0}
        >
          <Image
            src={service.banner_url}
            alt={service.title}
            w="full"
            h="full"
            objectFit="cover"
          />

          {!service.is_active && (
            <Box position="absolute" bottom={1} left={1}>
              <Badge colorPalette="red" textAlign="center">
                Inactive
              </Badge>
            </Box>
          )}

          {service.category && (
            <Box position="absolute" bottom={1} right={1}>
              <Badge
                colorPalette="blue"
                fontSize="2xs"
                borderRadius="md"
                outline="1px solid"
                outlineColor="border.emphasized"
              >
                {service.category}
              </Badge>
            </Box>
          )}
        </Box>
      )}

      <VStack align="start" gap={3} px={{ base: 2, md: 3 }} py={3} flex={1}>
        {/* Title */}
        <Heading
          size="sm"
          lineClamp={{ base: isExpanded ? undefined : 1, md: isExpanded ? undefined : 2 }}
          transition="all 0.3s ease"
        >
          {service.title}
        </Heading>

        {/* Description */}
        {service.description && (
          <Text
            fontSize="xs"
            color="fg.muted"
            lineClamp={isExpanded ? undefined : 3}
            transition="all 0.3s ease"
          >
            {service.description}
          </Text>
        )}

        {/* Highlights - Line Clamp Behavior */}
        {safeHighlights.length > 0 && (
          <Box
            w="full"
          >
            <HStack
              ref={containerRef}
              wrap={isExpanded ? "wrap" : "nowrap"}
              gap={2}
              w="full"
              overflow="hidden"
              transition="all 0.3s ease"
            >
              {displayedHighlights.map((highlight, i) => (
                <Badge
                  key={i}
                  data-badge
                  size="xs"
                  variant="subtle"
                  colorPalette="gray"
                  whiteSpace="nowrap"
                  border="0.5px solid"
                  borderColor="border.emphasized"
                  flexShrink={isExpanded ? 0 : 1}
                  maxW={isExpanded ? "none" : "200px"}
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {highlight}
                </Badge>
              ))}

              {/* "+X more" with tooltip - only show when collapsed */}
              {!isExpanded && hiddenHighlights.length > 0 && (
                <Tooltip
                  content={
                    <VStack align="start" gap={1} p={1} maxW="250px">
                      {hiddenHighlights.map((h, i) => (
                        <Text key={i} fontSize="xs">
                          • {h}
                        </Text>
                      ))}
                    </VStack>
                  }
                >
                  <Text
                    fontSize="2xs"
                    color="blue.500"
                    whiteSpace="nowrap"
                    fontWeight="medium"
                    cursor="help"
                    flexShrink={0}
                    _hover={{ textDecoration: "underline" }}
                  >
                    +{hiddenHighlights.length} more
                  </Text>
                </Tooltip>
              )}
            </HStack>
          </Box>
        )}

        {/* Spacer to push bottom info down */}
        {/* <Box flex={1} /> */}

        {/* Bottom info */}
        <Flex justify="space-between" w="full" align="center">
          <HStack gap={1}>
            {!service.price_usd && <FaCoins size={13} />}
            <Text fontSize="lg" fontWeight="medium">
              {service.price_usd ? `$${service.price_usd}` : "Free"}
            </Text>
          </HStack>
          {service.estimated_duration_minutes && (
            <HStack gap={1}>
              <LuClock4 size={13} />
              <Text>{service.estimated_duration_minutes}m</Text>
            </HStack>
          )}
        </Flex>
      </VStack>

      {/* Menu (Owner only) */}
      {showActions && (
        <Box
          position={"absolute"}
          top={2}
          right={2}
        >
          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="More options"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                <BsThreeDotsVertical />
              </IconButton>
            </Menu.Trigger>

            <Menu.Positioner>
              <Menu.Content minW="180px">
                {/* Edit - disabled for past sessions */}
                <Menu.Item
                  value="edit"
                  onClick={() => onEdit?.(service)}
                // disabled={isSessionPast}
                >
                  <LuPencil />
                  Edit Session
                </Menu.Item>

                <Menu.Separator />

                {/* Delete/Cancel - different text for past sessions */}
                <Menu.Item
                  value="delete"
                  color="red.500"
                  onClick={() => onDelete?.(service)}
                >
                  <LuTrash2 />
                  Delete Service
                </Menu.Item>

                <Menu.Arrow />
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
      )}

    </Box>
  );
};

export default ServiceCard;