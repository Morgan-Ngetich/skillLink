import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Spacer,
  Menu,
  SkeletonCircle,
  SkeletonText,
  Spinner,
} from '@chakra-ui/react';
import Search  from './Search'
import { Avatar } from '@/components/ui/avatar';
import { useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useNavigateWithRedirect } from '@/hooks/auth/authState';
import { useSession } from '@/hooks/auth/useSession';

const Header = () => {
  const { isLoggingOut, signOut } = useAuth();
  const { user, isLoading } = useSession()
  const navigate = useNavigate();

  useEffect(() => {
    console.log('UserME:', user);
    console.log('UserAvatar_url:', user?.user_metadata?.avatar_url);
  }, [user]);

  const navigateWithRedirect = useNavigateWithRedirect();

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

        <Search />

        <HStack gap={4}>
          {isLoading ? (
            // Show skeleton placeholders while loading user info
            <HStack gap={3} align="center">
              <SkeletonCircle size="8" />
              <SkeletonText noOfLines={1} width="100px" />
              <FaChevronDown size={20} />
            </HStack>
          ) : user ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <HStack gap={2}>
                      <Spinner size="sm" />
                      <Text>Logging out...</Text>
                    </HStack>
                  ) : (
                    <HStack gap={2}>
                      <Avatar size="sm" name={user.user_metadata?.full_name} src={user.user_metadata?.avatar_url} />
                      <Text display={{ base: 'none', md: 'inline' }} fontWeight="medium">
                        {user.user_metadata?.full_name}
                      </Text>
                      <FaChevronDown size={10} />
                    </HStack>
                  )}
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
                    onSelect={() => navigate({ to: '/dashboard/profile' })}
                    _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                    disabled={isLoggingOut}
                  >
                    Profile
                  </Menu.Item>

                  <Menu.Separator />

                  <Menu.Item
                    value="logout"
                    color="red.500"
                    onSelect={() => {
                      if (!isLoggingOut) signOut();
                    }}
                    _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <HStack gap={2}>
                        <Spinner size="sm" />
                        <Text>Logging out...</Text>
                      </HStack>
                    ) : (
                      'Logout'
                    )}
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          ) : (
            // User not logged in - optionally show login/signup buttons
            // null or uncomment to enable buttons:
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWithRedirect('/login')}
                _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                border="1px solid"
              >
                Get Started for Free
              </Button>
            </>
          )}


          <ColorModeButton />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
