import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Drawer,
  IconButton,
  CloseButton,
  Portal,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';

import { AvatarGroup, Avatar } from '@/components/ui';
import InfoPanelContent from './InfoPanelContent';
import { DrawerContainer } from './InfoPanelContent';
import { LuInfo } from 'react-icons/lu';
import { useRef } from "react"
import { FaArrowLeft, FaArrowRight, FaCommentDots, FaHandDots } from 'react-icons/fa6';
import { HiDotsCircleHorizontal } from 'react-icons/hi';

const MentorSessionInfo = ({ data, onPrevious, onNext, currentIndex, totalSlides, isMobileLayout }) => {
  const portalRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onClose } = useDisclosure({ defaultOpen: true })

  return (
    <Drawer.Root closeOnInteractOutside={true} isOpen={isOpen} onClose={onClose}>
      <DrawerContainer ref={portalRef}>
        <Box
          w="full"
          p={{ base: 3, md: 4 }}
          position="relative"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          rounded={{ base: "lg", md: "lg" }}
          bgImage={`url('${data.session.image}')`}
          bgSize="cover"
          bgRepeat="no-repeat"
          overflow="hidden"
          h={"full"}
        // border={"1px solid"}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1}
          />

          <Box position="relative" zIndex={2} h="full" display="flex" flexDirection="column">
            <Flex justify="space-between" align="center" mb={{ base: 3, md: 4 }}>
              <AvatarGroup size={{ base: "xs", md: "sm" }}>
                {data.avatarGroup.map((mentee, index) => (
                  <Avatar
                    key={index}
                    src={mentee.avatar}
                    border="2px solid"
                  />
                ))}
              </AvatarGroup>
              <HStack gap={{ base: 1, md: 2 }}>
                <Badge
                  px={{ base: 2, md: 3 }}
                  py={1}
                  fontSize="xs"
                  fontWeight="bold"
                  colorPalette={'green'}
                  variant={'subtle'}
                >
                  Starts in: {data.session.startTime}
                </Badge>
                {/* Show info button only on mobile */}
                <Box
                  display={isMobileLayout ? "block" : { base: "block", md: "none" }}
                >
                  <Drawer.Trigger asChild>
                    <IconButton
                      size="sm"
                      variant="outline"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{ bg: "whiteAlpha.300" }}
                      rounded="full"
                    >
                      <LuInfo />
                    </IconButton>
                  </Drawer.Trigger>
                </Box>
              </HStack>
            </Flex>

            <Box mt="auto" mb={{ base: 3, md: 4 }}>
              <HStack gap={2} align="start" mb={{ base: 2, md: 3 }}>
                <Avatar
                  src={data.mentor.avatar}
                  size={{ base: "sm", md: "md" }}
                  name={data.mentor.name}
                />
                <VStack align="start" gap={0}>
                  <Text
                    fontSize={{ base: "sm", md: "lg" }}
                    fontWeight="bold"
                    color="white"
                    lineClamp={1}
                  >
                    {data.mentor.name}
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color="gray.300"
                    lineClamp={{ base: 1, md: 2 }}
                  >
                    {data.mentor.role} @ {data.mentor.company} — {data.mentor.bio}
                  </Text>
                </VStack>
              </HStack>
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                mb={1}
                color="gray.50"
                lineClamp={2}
              >
                {isMobile ? data.session.fullTitle : data.session.title}
              </Text>
            </Box>

            <Box
              bg={{ base: 'whiteAlpha.700', _dark: 'blackAlpha.600' }}
              p={{ base: 3, md: 4 }}
              borderRadius="lg"
              backdropFilter="blur(4px)"
              position="relative"
            >

              {/* Navigation Arrows */}
              <Box position="absolute" top={{base: 1, md: 2}} right={2}>
                <HStack gap={4}>
                  <IconButton
                    size="xs"
                    variant="subtle"
                    border="1px solid"
                    borderRadius={"lg"}
                    onClick={onPrevious}
                  >
                    <FaArrowLeft />
                  </IconButton>

                  <IconButton
                    size="xs"
                    variant="subtle"
                    border="1px solid"
                    borderRadius={"lg"}
                    onClick={onNext}
                  >
                    <FaArrowRight />
                  </IconButton>
                </HStack>
              </Box>

              {/* Carousel Indicators */}
              <Box position="absolute" bottom={1} right={4}>
                <HStack gap={1}>
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <Box
                      key={idx}
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg={idx === currentIndex ? 'gray.700' : 'gray.300'}
                      transition="all 0.3s"
                    />
                  ))}
                </HStack>
              </Box>


              <Text fontSize="sm" color="fg.muted" mb={2}>
                Session Slots
              </Text>
              <Flex
                direction={{ base: "row", md: "row" }}
                justify={{ md: "space-between" }}
                align={{ base: "start", md: "center" }}
                gap={{ base: 3, md: 0 }}
              >
                <Box>
                  <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
                    {data.session.bookedSlots} / {data.session.totalSlots} Booked
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {data.session.bookedSlots === data.session.totalSlots ? "Fully booked" : "Limited spots available"}
                  </Text>
                </Box>
                <Button
                  size={{ base: "sm", md: "sm" }}
                  rounded="full"
                  fontWeight="bold"
                  px={{ base: 4, md: 6 }}
                  flex={{ base: 1, md: "none" }}
                  _hover={{ transform: 'scale(1.05)' }}
                  _active={{ transform: 'scale(0.98)' }}
                  disabled={data.session.bookedSlots === data.session.totalSlots}
                >
                  {data.session.bookedSlots === data.session.totalSlots ? "Full" : "Book Now"}
                </Button>
              </Flex>
            </Box>
          </Box>
        </Box>
      </DrawerContainer>

      {/* Drawer - Only renders on mobile */}
      <Portal container={portalRef}>
        <Box display={isMobileLayout ? "block" : { base: "block", md: "none" }}>
          <Drawer.Backdrop pos="absolute" boxSize="full" bg="blackAlpha.600" />
          <Drawer.Positioner pos="absolute" boxSize="full">
            <Drawer.Content
              maxW={{ base: "full", md: "full" }}
              w={{ base: "100vw", md: "full" }}
              h="full"
              mx={{ base: 0, sm: "auto" }}
            >
              {/* <Drawer.Header px={{ base: 3, md: 6 }} pt={4} pb={2}>
                <Drawer.Title fontWeight="semibold">
                  Session Information
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" variant={"outline"} />
                </Drawer.CloseTrigger>
              </Drawer.Header> */}
              <Drawer.Body p={0} flex="1" minH="0" overflowY="auto">
                <Box px={{ base: 4, md: 6 }} h="full" pt={2}>
                  <InfoPanelContent data={data} isMobileLayout={isMobileLayout} closeButton={
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="sm" variant="outline" />
                    </Drawer.CloseTrigger>
                  } />
                </Box>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Box>
      </Portal>
    </Drawer.Root>
  );
};

export default MentorSessionInfo