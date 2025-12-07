import { Box, VStack, Text, HStack, Badge } from "@chakra-ui/react";
import { LuBriefcase } from "react-icons/lu";
import type { MentorServicePublic } from "@/client";

interface ServiceResultItemProps {
  service: MentorServicePublic;
}

export const ServiceResultItem = ({ service }: ServiceResultItemProps) => {
  return (
    <Box px={4} py={3} display="flex" alignItems="start" gap={3}>
      <Box
        boxSize="12"
        borderRadius="md"
        bg="green.subtle"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        bgImage={service.banner_url ? `url(${service.banner_url})` : undefined}
        bgSize="cover"
      >
        <LuBriefcase size={20} color="white" />
      </Box>
      <VStack align="start" gap={1} flex="1">
        <HStack>
          <Text fontWeight="medium" fontSize="md" lineClamp={1}>
            {service.title}
          </Text>
          <Text>•</Text>
          <HStack gap={2}>
            <LuBriefcase size={14} style={{ opacity: 0.6 }} />
            <Text fontSize="xs" color="fg.muted" fontWeight="medium">
              SERVICE
            </Text>
          </HStack>
        </HStack>
        <Text fontSize="sm" color="fg.muted" lineClamp={1}>
          {service.description}
        </Text>
        <HStack gap={2} fontSize="xs" color="fg.muted">
          {service.category && (
            <>
              <Badge size="sm" colorPalette="green" variant="subtle">
                {service.category}
              </Badge>
              <Text>•</Text>
            </>
          )}
          <Text fontWeight="semibold">
            {service.price_usd ? `$${service.price_usd}` : "Free"}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};