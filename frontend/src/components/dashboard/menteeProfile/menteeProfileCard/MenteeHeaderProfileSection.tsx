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
      direction={'column'}
    >

      <HStack justify={'space-between'} w="full">
        <VStack align={'flex-start'} gap={0}>

          <Heading size="md">{user.full_name}</Heading>
          <Text fontSize="sm">{user.role}</Text>
          <Text fontSize="sm">{user.location}</Text>
        </VStack>

        {/* Education & Work Logos */}
        <VStack gap={4}>
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
      </HStack>


      {/* Left: User Details */}
      <Flex direction={{base: "column", lg: "row-reverse"}} align={{base: "flex-start", md: "flex-end" }} gap={0} w="full" justify={"space-between"}>
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

        <HStack mt={3} gap={3}>
          <Button colorScheme="blue" size="sm">Get a Mentor</Button>
          <Button variant="outline" size="sm">Settings</Button>
        </HStack>
      </Flex>


    </Flex>
  );
}
