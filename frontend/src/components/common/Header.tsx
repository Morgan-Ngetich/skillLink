import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Spacer,
  Menu,
} from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';
import { useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { ColorModeButton } from '@/components/ui/color-mode';

const Header = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('User:', user);
  }, [user]);

  return (
    <Box
      as="header"
      w="100%"
      px={{ base: 4, md: 8 }}
      py={3}
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderBottom="1px solid"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      position="sticky"
      top="0"
      zIndex="100"
    >
      <Flex align="center">
        <Text
          fontSize={{ base: 'lg', md: '2xl' }}
          fontWeight="bold"
          color={{ base: 'blue.600', _dark: 'blue.300' }}
          letterSpacing="-0.5px"
          cursor="pointer"
          onClick={() => navigate({ to: '/' })}
        >
          MENTspace
        </Text>

        <Spacer />

        {!isLoading && user ? (
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <HStack gap={2}>
                  <Avatar
                    size="sm"
                    name={user.full_name}
                    src={user.avatar_url}
                    bg={{ base: 'blue.100', _dark: 'blue.800' }}
                    color={{ base: 'blue.800', _dark: 'white' }}
                  />
                  <Text display={{ base: 'none', md: 'inline' }} fontWeight="medium">
                    {user.full_name}
                  </Text>
                  <FaChevronDown size={10} />
                </HStack>
              </Button>
            </Menu.Trigger>

            <Menu.Positioner>
              <Menu.Content
                bg={{ base: 'white', _dark: 'gray.800' }}
                border="1px solid"
                borderColor={{ base: 'gray.100', _dark: 'gray.700' }}
                borderRadius="md"
                shadow="lg"
                py={2}
                minW="180px"
              >
                <Menu.Item
                  value="profile"
                  onSelect={() => navigate({ to: '/profile' })}
                  _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                >
                  Profile
                </Menu.Item>

                <Menu.Separator />

                <Menu.Item
                  value="logout"
                  onSelect={() => {
                    signOut
                  }}
                  _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                >
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        ) : (
          <HStack gap={4}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/login' })}
              _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
            >
              Login
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => navigate({ to: '/signup' })}
            >
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
