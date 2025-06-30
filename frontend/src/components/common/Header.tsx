import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Spacer,
  Menu,
} from '@chakra-ui/react';
import { useEffect } from "react"
import { Avatar } from '@chakra-ui/react';
import { FaArrowDownLong } from "react-icons/fa6";
import { useAuthQuery } from '@/hooks/auth/useAuthQuery';
import { useNavigate } from '@tanstack/react-router';
import { ColorModeButton } from '@/components/ui/color-mode';

const Header = () => {
  const { data: user, isLoading } = useAuthQuery();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User:", user);
  }, [user]);

  return (
    <Box
      as="header"
      w="100%"
      bg="white"
      px={6}
      py={3}
      borderBottom="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex align="center">
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          SkillUp
        </Text>
        <Spacer />
        {!isLoading && user ? (
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <HStack gap="2">
                  <Avatar.Root size="sm">
                    <Avatar.Fallback>{user.full_name?.[0]}</Avatar.Fallback>
                    <Avatar.Image src={user.avatar_url} alt={user.full_name} />
                  </Avatar.Root>
                  <Text display={{ base: 'none', md: 'inline' }}>{user.full_name}</Text>
                  <FaArrowDownLong size={4} />
                </HStack>
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="profile" onSelect={() => navigate({ to: '/profile' })}>
                  Profile
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item value="logout" onSelect={() => {
                  // handle logout logic
                  navigate({ to: '/login' });
                }}>
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        ) : (
          <HStack gap={4}>
            <Button variant="ghost" onClick={() => navigate({ to: '/login' })}>
              Login
            </Button>
            <Button colorScheme="blue" onClick={() => navigate({ to: '/signup' })}>
              Sign Up
            </Button>
            <ColorModeButton />
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
