import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Link,
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';
import { Avatar, Tag } from '@/components/ui';
import { LuUser, LuUsers, LuBookOpen, } from 'react-icons/lu';
// import type { JSX } from 'react/jsx-runtime';
import React from 'react';

interface InfoPanelContentProps {
  data: any
  closeButton?: any
  onClose?: () => void
  isMobileLayout: boolean
}

// InfoPanel component as drawer content
const InfoPanelContent: React.FC<InfoPanelContentProps> = ({ data, closeButton, isMobileLayout }) => {
  const avs = { base: 'gray.100', _dark: 'gray.700' };
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Box
      display="flex"
      flexDirection="column"
      h='full'
      p={isMobileLayout || isMobile ? 1 : 6}
    >
      <Tabs.Root defaultValue="details" display="flex" flexDirection="column" flex="1" minH="0">
        <Tabs.List mb={{ base: 0, md: 4 }}>
          <Tabs.Trigger value="details">
            <HStack>
              <LuUser />
              Details
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="members">
            <HStack>
              <LuUsers />
              Mentees
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="prep">
            <HStack>
              <LuBookOpen />
              Preparation
            </HStack>
          </Tabs.Trigger>
          <Tabs.Indicator />
          {(isMobile || isMobileLayout) && (
            <Tabs.Trigger value="close">
              <Box position="absolute" top={-2} right={-2}>
                {closeButton}
              </Box>
            </Tabs.Trigger>
          )}
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Content value="details" flex="1" minH="0" overflowY="auto">
          <VStack align="start" gap={3} >
            <Flex direction={"row"} justify={'space-between'} w="full">
              <HStack>
                <Text fontSize="sm">{data.session.date}</Text>
                {isMobile && data.session.bookedSlots === data.session.totalSlots && (
                  <Text color="fg.subtle">•</Text>
                )}
                {isMobile && data.session.bookedSlots === data.session.totalSlots && (
                  <Tag bg={"bg.warning"}>
                    <Text color="fg.warning">
                      Session full
                    </Text>
                  </Tag>
                )}
              </HStack>
            </Flex>

            <Text fontSize="2xl" fontWeight="bold" lineClamp={2} color={data.session.bookedSlots === data.session.totalSlots ? "fg.muted" : ""}>
              {data.session.fullTitle}
            </Text>
            <Text fontSize="sm" color="fg.muted" lineClamp={2}>
              {data.session.description}
            </Text>
            <HStack justify="space-between" w="full" mt={2}>
              <HStack>
                <Avatar size="sm" src={data.mentor.avatar} />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold">{data.mentor.name}</Text>
                  <Text fontSize="xs">Mentor</Text>
                </Box>
              </HStack>
              <Button size="xs" rounded="md">
                View Profile
              </Button>
            </HStack>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="members" flex="1" minH="0" overflowY="auto">
          <VStack align="stretch" gap={1}>
            {data.avatarGroup.map((mentee, index) => (
              <Flex key={index} align="center" p={{ base: 1, md: 2 }} borderRadius="md" _hover={{ bg: avs }} borderBottom={'1px solid'}>
                <Avatar size="sm" src={mentee.avatar} name={mentee.name} mr={3} />
                <Box flex={1}>
                  <Text fontWeight="medium">{mentee.name}</Text>
                  <Text fontSize="xs" color="fg.muted">{mentee.location}</Text>
                </Box>
                <Badge colorPalette="green" fontSize="xs">Booked</Badge>
              </Flex>
            ))}
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="prep" flex="1" minH="0" overflowY="auto">
          <VStack align="stretch" gap={4} pb={4}>
            {data.preparationMaterials.map((material, index) => {
              const IconComponent = material.icon;
              return (
                <Box key={index} bg="gray.50" _dark={{ bg: "gray.800" }} p={{ base: 2, md: 2 }} rounded="lg" shadow="sm">
                  <HStack align="start">
                    <IconButton boxSize={5} mt={1} color={material.color} variant="plain">
                      <IconComponent />
                    </IconButton>
                    <Box>
                      <Text fontWeight="medium">{material.title}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        {material.description}
                      </Text>
                      {material.link && (
                        <Link href={material.link} color="blue.600" fontSize="sm">
                          {material.linkText}
                        </Link>
                      )}
                    </Box>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

// Container component for the drawer
export const DrawerContainer = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>((props, ref) => {
  return (
    <Box
      pos="relative"
      overflow="hidden"
      ref={ref}
      w="full"
      h="full"
      {...props}
    />
  );
});


export default InfoPanelContent;
