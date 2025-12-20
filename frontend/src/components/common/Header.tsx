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
  useBreakpointValue,
} from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';
import { FaChevronDown } from 'react-icons/fa6';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { ColorModeButton } from '@/components/ui/colormode/color-mode';
import { useNavigateWithRedirect } from '@/hooks/auth/authState';
import { useSession } from '@/hooks/auth/useSession';
import { HiMenuAlt3 } from 'react-icons/hi';
import Search from './search/IndexSearch';

const Header = () => {
  const { user: authUser, isLoggingOut, signOut } = useAuth();
  const { user, isLoading, cachedUserMetadata } = useSession();
  const navigate = useNavigate();
  const navigateWithRedirect = useNavigateWithRedirect();

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Gate UI decisions until we know auth state
  const showUserUI = !isLoading && user;
  const showSignInButton = !isLoading && !user;

  // Use cached metadata for instant mentor status check
  // Priority: authUser (live data) > cachedUserMetadata (cached) > hide during loading
  const isMentor = authUser?.is_mentor ?? cachedUserMetadata?.is_mentor;
  const showBecomeMentorButton = !isLoading && !isMentor;

  const handleBecomeMentorClick = () => {
    // Use cached or live UUID
    const userUuid = authUser?.uuid ?? cachedUserMetadata?.uuid;

    if (userUuid) {
      navigateWithRedirect(
        `/profile/${userUuid}?drawer=mentor-setup&step=expertise`,
        `/profile/${userUuid}`
      );
    } else {
      navigateWithRedirect('/login', '/');
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
        <HStack gap={{ base: 2, md: 3 }} flex={{ base: '0 0 auto', md: '0 0 200px' }}>
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
            letterSpacing="-0.5px"
            cursor="pointer"
            onClick={() => navigate({ to: '/' })}
            whiteSpace="nowrap"
          >
            MENTspace
          </Text>
        </HStack>

        {/* Center Section - Search */}
        {!isMobile && (
          <Box
            flex="1"
            maxW={{ base: '100%', md: '650px' }}
            mx={4}
          >
            <Search />
          </Box>
        )}

        {/* Right Section - User Actions */}
        <HStack
          gap={{ base: 1, md: 2 }}
          flex={{ base: '0 0 auto', md: '0 0 auto' }}
          justify="flex-end"
        >

          {isMobile && (
            <Box display={{ base: 'block', md: 'none' }}>
              <Search />
            </Box>
          )}

          {/* Color Mode Toggle */}
          <ColorModeButton variant="ghost" size="sm" />

          {/* Become a Mentor Button - Shows only when NOT mentor and NOT loading */}
          {showBecomeMentorButton && (
            <Button
              onClick={handleBecomeMentorClick}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Become a Mentor
            </Button>
          )}

          {/* Auth UI - Three states: Loading, Authenticated, Unauthenticated */}
          {isLoading ? (
            // LOADING STATE: Show skeleton until session is confirmed
            <HStack gap={2}>
              <SkeletonCircle size="8" />
              <SkeletonText
                noOfLines={1}
                width="80px"
                display={{ base: 'none', lg: 'block' }}
              />
            </HStack>
          ) : showUserUI ? (
            // AUTHENTICATED STATE: User menu
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoggingOut}
                  px={{ base: 1, md: 2 }}
                  h={{ base: '36px', md: '40px' }}
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
                      {isMentor && (
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
                      onSelect={() => {
                        const userUuid = authUser?.uuid ?? cachedUserMetadata?.uuid;
                        if (userUuid) {
                          navigate({ to: `/profile/${userUuid}` });
                        }
                      }}
                      _hover={{ bg: 'bg.muted' }}
                      disabled={isLoggingOut}
                      cursor="pointer"
                      px={4}
                      py={2}
                    >
                      <Text fontSize="sm">Profile</Text>
                    </Menu.Item>
                  </Box>

                  <Box borderTop="1px solid" borderColor="border.subtle" pt={1}>
                    <Menu.Item
                      value="logout"
                      onSelect={() => {
                        if (!isLoggingOut) signOut();
                      }}
                      _hover={{ bg: 'bg.muted' }}
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
          ) : showSignInButton ? (
            // UNAUTHENTICATED STATE: Sign In button
            <Button
              size={{ base: 'xs', md: 'sm' }}
              onClick={() => navigateWithRedirect('/login')}
              fontWeight="semibold"
              px={{ base: 3, md: 4 }}
              fontSize={{ base: 'xs', md: 'sm' }}
            >
              Sign In
            </Button>
          ) : null}
        </HStack>
      </Flex>
    </Box >
  );
};

export default Header;