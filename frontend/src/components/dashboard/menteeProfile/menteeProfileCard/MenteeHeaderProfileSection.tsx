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

const user = {
  full_name: 'Morgan Ngetich',
  role: 'Full-Stack Developer',
  location: 'Nairobi, Kenya',
  education_logo: 'https://picsum.photos/30?random=1',
  work_logo: 'https://picsum.photos/30?random=2',
  twitter: 'https://twitter.com/fakeprofile',
  linkedin: 'https://linkedin.com/in/fakeprofile',
  github: 'https://github.com/fakeprofile',
  instagram: 'https://instagram.com/fakeprofile'
};

export default function MenteeHeaderProfileSection() {
  return (
    <Flex
      justify="space-between"
      align="flex-start"
    >
      {/* Left: User Details */}
      <VStack align="flex-start" gap={3}>
        <VStack align={'flex-start'} gap={0}>

          <Heading size="md">{user.full_name}</Heading>
          <Text fontSize="sm">{user.role}</Text>
          <Text fontSize="sm">{user.location}</Text>
        </VStack>

        <HStack mt={3} gap={3}>
          <Button colorScheme="blue" size="sm">Get a Mentor</Button>
          <Button variant="outline" size="sm">Settings</Button>
        </HStack>
      </VStack>

      {/* Right: Logos + Socials */}
      <Flex direction="column" align="flex-end" justify="space-between" h="100%">
        {/* Education & Work Logos */}
        <VStack gap={4} mb={6}>
          <Image
            src={user.education_logo}
            alt="Education"
            boxSize="40px"
            borderRadius="sm"
            objectFit="cover"
          />
          <Image
            src={user.work_logo}
            alt="Work"
            boxSize="40px"
            borderRadius="sm"
            objectFit="cover"
          />
        </VStack>

        {/* Social Media Icons */}
        <HStack gap={3}>
          {user.linkedin && (
            <Link href={user.linkedin}>
              <FaLinkedin size={25} />
            </Link>
          )}
          {user.github && (
            <Link href={user.github}>
              <FaGithub size={25} />
            </Link>
          )}
          {user.twitter && (
            <Link href={user.twitter} >
              <FaXTwitter size={25} />
            </Link>
          )}
          {user.instagram && (
            <Link href={user.instagram}>
              <FaInstagram size={25} />
            </Link>
          )}
        </HStack>
      </Flex>
    </Flex>
  );
}
