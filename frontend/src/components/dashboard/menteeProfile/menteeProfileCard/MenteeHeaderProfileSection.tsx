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
} from '@chakra-ui/react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

interface MenteeHeaderProfileSectionProps {
  user?: UserPublic;
  profile?: UserPublic["profile"];
}

const MenteeHeaderProfileSection: React.FC<MenteeHeaderProfileSectionProps> = ({ user, profile }) => {
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
      <Flex direction={{ base: "column", lg: "row-reverse" }} align={{ base: "flex-start", md: "flex-end" }} gap={0} w="full" justify={"space-between"}>
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

        <HStack mt={4} gap={3}>
          {user?.is_mentee && (
            <Link href="/explore">
              <Button size="sm">Find a Mentor</Button>
            </Link>
          )}
          {/* <Button variant="outline" size="sm">Settings</Button> */}
        </HStack>
      </Flex>


    </Flex>
  );
}


export default MenteeHeaderProfileSection;