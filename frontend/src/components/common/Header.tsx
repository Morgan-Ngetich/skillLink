import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Menu,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import Search from './Search';
import { Avatar } from '@/components/ui/avatar';
import { useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useNavigateWithRedirect } from '@/hooks/auth/authState';
import { useSession } from '@/hooks/auth/useSession';
import { HiMenuAlt3 } from 'react-icons/hi';

const Header = () => {
  const { user: authUser, isLoggingOut, signOut } = useAuth();
  const { user, isLoading } = useSession();
  const navigate = useNavigate();



  useEffect(() => {
    console.log('UserME:', user);
    console.log('UserAvatar_url:', user?.user_metadata?.avatar_url);
  }, [user]);

  const navigateWithRedirect = useNavigateWithRedirect();

  const handleBecomeMentorClick = () => {
    if (authUser) {
      navigateWithRedirect('/mentor-application', "/dashboard/profile");
    } else {
      navigateWithRedirect('/login', '/mentor-application');
    }
  };

  return (
    <Box
      as="header"
      w="100%"
      px={{ base: 3, md: 4 }}
      py={2}
      borderBottom="1px solid"
      borderColor="border.subtle"
      position="sticky"
      top="0"
      zIndex="100"
    >
      <Flex align="center" gap={{ base: 2, md: 4 }} justify="space-between">
        {/* Left Section - Logo + Menu (Mobile) */}
        <HStack gap={{ base: 2, md: 3 }} flex={{ base: "0 0 auto", md: "0 0 200px" }}>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Menu"
            variant="ghost"
            size="sm"
            fontSize="2xl"
          >
            <HiMenuAlt3 />
          </IconButton>

          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="bold"
            // color="teal.500"
            letterSpacing="-0.5px"
            cursor="pointer"
            onClick={() => navigate({ to: '/' })}
            whiteSpace="nowrap"
          >
            MENTspace
          </Text>
        </HStack>

        {/* Center Section - Search */}
        <Box
          flex="1"
          maxW={{ base: "100%", md: "650px" }}
          display={{ base: 'none', md: 'block' }}
          mx={4}
        >
          <Search />
        </Box>

        {/* Right Section - User Actions */}
        <HStack gap={{ base: 1, md: 2 }} flex={{ base: "0 0 auto", md: "0 0 auto" }} justify="flex-end">
          {/* Mobile Search Icon */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Search />
          </Box>

          {/* Color Mode Toggle */}
          <ColorModeButton variant="ghost" size="sm" />

          {!authUser?.is_mentor && (
            <Button onClick={handleBecomeMentorClick}>
              Become a Mentor
            </Button>
          )}

          {/* User Menu / Auth Buttons */}
          {isLoading ? (
            <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
              <SkeletonCircle size="8" />
              <SkeletonText noOfLines={1} width="80px" display={{ base: 'none', lg: 'block' }} />
            </HStack>
          ) : user ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoggingOut}
                  px={{ base: 1, md: 2 }}
                  h={{ base: "36px", md: "40px" }}
                >
                  {isLoggingOut ? (
                    <HStack gap={2}>
                      <Spinner size="sm" />
                      <Text display={{ base: 'none', lg: 'inline' }}>Logging out...</Text>
                    </HStack>
                  ) : (
                    <HStack gap={2}>
                      <Avatar
                        size={{ base: 'xs', md: 'sm' }}
                        name={user.user_metadata?.full_name}
                        src={user.user_metadata?.avatar_url}
                      />
                      {authUser?.is_mentor && (
                        <Text
                          display={{ base: 'none', lg: 'inline' }}
                          fontWeight="medium"
                          fontSize="sm"
                        >
                          {user.user_metadata?.full_name}
                        </Text>
                      )}
                      <FaChevronDown size={10} style={{ opacity: 0.7 }} />
                    </HStack>
                  )}
                </Button>
              </Menu.Trigger>

              <Menu.Positioner>
                <Menu.Content
                  bg="bg"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="lg"
                  shadow="lg"
                  py={2}
                  minW="200px"
                >
                  <Box px={4} py={3} borderBottom="1px solid" borderColor="border.subtle">
                    <HStack gap={3}>
                      <Avatar
                        size="md"
                        name={user.user_metadata?.full_name}
                        src={user.user_metadata?.avatar_url}
                      />
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm">
                          {user.user_metadata?.full_name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          {user.email}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>

                  <Box py={1}>
                    <Menu.Item
                      value="profile"
                      onSelect={() => navigate({ to: '/dashboard/profile' })}
                      _hover={{ bg: "bg.muted" }}
                      disabled={isLoggingOut}
                      cursor="pointer"
                      px={4}
                      py={2}
                    >
                      <Text fontSize="sm">Profile</Text>
                    </Menu.Item>

{/* 
                    <Menu.Item
                      value="dashboard"
                      onSelect={() => navigate({ to: '/dashboard' })}
                      _hover={{ bg: "bg.muted" }}
                      disabled={isLoggingOut}
                      cursor="pointer"
                      px={4}
                      py={2}
                    >
                      <Text fontSize="sm">Dashboard</Text>
                    </Menu.Item> */}
                    
                  </Box>

                  <Box borderTop="1px solid" borderColor="border.subtle" pt={1}>
                    <Menu.Item
                      value="logout"
                      onSelect={() => {
                        if (!isLoggingOut) signOut();
                      }}
                      _hover={{ bg: "bg.muted" }}
                      disabled={isLoggingOut}
                      cursor="pointer"
                      px={4}
                      py={2}
                    >
                      {isLoggingOut ? (
                        <HStack gap={2}>
                          <Spinner size="xs" />
                          <Text fontSize="sm">Logging out...</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="red.500">
                          Logout
                        </Text>
                      )}
                    </Menu.Item>
                  </Box>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          ) : (
            <Button
              size={{ base: 'xs', md: 'sm' }}
              onClick={() => navigateWithRedirect('/login')}
              // bg="teal.500"
              // color="white"
              // _hover={{ bg: 'teal.600' }}
              fontWeight="semibold"
              px={{ base: 3, md: 4 }}
              fontSize={{ base: 'xs', md: 'sm' }}
            >
              Sign In
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;