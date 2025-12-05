import type { UserPublic } from '@/client';
import {
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Image,
  Link,
  HoverCard,
  Portal,
  Stack,
  Separator,
} from '@chakra-ui/react';
import { CiSettings } from 'react-icons/ci';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

interface MenteeHeaderProfileSectionProps {
  user?: UserPublic;
  profile?: UserPublic["profile"];
  readOnly: boolean;
  onOpenSettings?: () => void
}

const HeaderProfileSection: React.FC<MenteeHeaderProfileSectionProps> = ({ user, profile, readOnly, onOpenSettings }) => {
  const mentorSettings = user?.profile?.mentor_profile?.settings
  return (
    <Flex
      justify="space-between"
      align="flex-start"
      direction={'column'}
    >

      <HStack
        justify="space-between"
        w="full"
        mt={
          profile?.education?.length && profile?.experience?.length
            ? 0
            : 4
        }
        gap={0}
      >
        <VStack align="flex-start" gap={0}>
          <Heading size="md">{user?.full_name}</Heading>
          <Text fontSize="sm">{profile?.title}</Text>
          <Text fontSize="sm">{profile?.location}</Text>
        </VStack>

        {/* Education & Work Logos */}
        <VStack gap={4}>
          {profile?.experience?.length ? (
            <Image
              src={profile.experience[0]?.logo}
              alt="Experience"
              boxSize="40px"
              borderRadius="sm"
              objectFit="cover"
            />
          ) : null}

          {profile?.education?.length ? (
            <Image
              src={profile.education[0]?.logo}
              alt="Education"
              boxSize="40px"
              borderRadius="sm"
              objectFit="cover"
            />
          ) : null}
        </VStack>
      </HStack>

      {/* Left: User Details */}
      <Flex direction={{ base: "column", lg: "row-reverse" }} align={{ base: "flex-start", md: "flex-end" }} gap={0} w="full" justify={"space-between"} mt={readOnly ? 4 : 0}>
        {/* Social Media Icons */}
        <HStack gap={3}>
          {profile?.social_links?.linkedin && (
            <Link href={profile?.social_links?.linkedin || ''}>
              <FaLinkedin size={25} />
            </Link>
          )}
          {profile?.social_links?.github && (
            <Link href={profile?.social_links?.github || ''}>
              <FaGithub size={25} />
            </Link>
          )}
          {profile?.social_links?.Xtwitter && (
            <Link href={profile?.social_links?.Xtwitter || ''} >
              <FaXTwitter size={25} />
            </Link>
          )}
          {profile?.social_links?.instagram && (
            <Link href={profile?.social_links?.instagram || ''}>
              <FaInstagram size={25} />
            </Link>
          )}
        </HStack>

        {!readOnly && (
          <HStack mt={4} gap={3}>
            {user?.is_mentee && (
              <Link href="/explore">
                <Button size="sm">Find a Mentor</Button>
              </Link>
            )}


            {/* SETTINGS BUTTON + HOVER POPOVER */}
            {mentorSettings && (
              <HoverCard.Root
                size="sm"
                openDelay={150}
              >
                <HoverCard.Trigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenSettings} // click opens full settings modal
                  >
                    <CiSettings style={{ marginRight: 4 }} />
                    Settings
                  </Button>
                </HoverCard.Trigger>

                <Portal>
                  <HoverCard.Positioner>
                    <HoverCard.Content
                      p={4}
                      borderRadius="lg"
                      shadow="lg"
                      bg="bg.surface"
                      minW="260px"
                    >
                      <HoverCard.Arrow />

                      <Stack gap={3}>
                        <Text fontWeight="semibold" textStyle="sm">
                          ⚙️ Settings Overview
                        </Text>

                        <Stack gap={2} textStyle="xs">
                          <HStack justify="space-between" color="fg.muted">
                            <Text>Buffer time</Text>
                            <Text fontWeight="medium" color="fg.default">
                              {mentorSettings.booking_buffer_hours}h
                            </Text>
                          </HStack>
                          <Separator />
                          <HStack justify="space-between" color="fg.muted">
                            <Text>Session gap</Text>
                            <Text fontWeight="medium" color="fg.default">
                              {mentorSettings.session_gap_minutes}min
                            </Text>
                          </HStack>
                          <Separator />
                          <HStack justify="space-between" color="fg.muted">
                            <Text>Auto-accept</Text>
                            <Text fontWeight="medium" color="fg.default">
                              {mentorSettings.auto_accept_bookings ? "On ✓" : "Off ✗"}
                            </Text>
                          </HStack>
                          <Separator />
                          <HStack justify="space-between" color="fg.muted">
                            <Text>Public availability</Text>
                            <Text fontWeight="medium" color="fg.default">
                              {mentorSettings.allow_public_availability_view ? "Visible 👁️" : "Hidden 🔒"}
                            </Text>
                          </HStack>
                          <Separator />
                          {mentorSettings.max_mentees && (
                            <HStack justify="space-between" color="fg.muted">
                              <Text>Max mentees</Text>
                              <Text fontWeight="medium" color="fg.default">
                                {mentorSettings.max_mentees}
                              </Text>
                            </HStack>
                          )}
                          <Separator />
                          <HStack justify="space-between" color="fg.muted">
                            <Text>Response time</Text>
                            <Text fontWeight="medium" color="fg.default">
                              {mentorSettings.response_time_hours}h
                            </Text>
                          </HStack>
                        </Stack>
                      </Stack>
                    </HoverCard.Content>
                  </HoverCard.Positioner>
                </Portal>
              </HoverCard.Root>
            )}

          </HStack>
        )}
      </Flex>
    </Flex>
  );
}


export default HeaderProfileSection;