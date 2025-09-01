import React, { useEffect, useState } from 'react';
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
  IconButton,
  Drawer,
  Portal,
  useBreakpointValue,
  Collapsible,
  useDisclosure
} from '@chakra-ui/react';
import { IoMenu } from "react-icons/io5"
import Sidebar from './Sidebar';
import { Avatar } from '@/components/ui/avatar';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSession } from '@/hooks/auth/useSession';
import { useNavigate } from '@tanstack/react-router';
import { ColorModeButton, useColorModeValue } from '@/components/ui';
import { useNavigateWithRedirect } from '@/hooks/auth/authState';
import { DocsSearch } from './DocsSearch';
import { FaCalendar } from 'react-icons/fa6';
import ViewCalendar from './calendar/ViewCalendar';

interface HeaderProps {
  page?: "crackmode/docs";
}

const CrackModeHeader: React.FC<HeaderProps> = ({ page }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { user, isLoggingOut, signOut } = useAuth();
  const { isLoading } = useSession()
  const navigate = useNavigate();
  const navigateWithRedirect = useNavigateWithRedirect();

  // Color mode values
  const crack = useColorModeValue("green.500", "green.400");
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mobile search state
  const { open: isSearchOpen, onToggle: toggleSearch, onClose: closeSearch } = useDisclosure();

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const showFullSearch = useBreakpointValue({ base: false, lg: true });

  useEffect(() => {
    console.log('UserME:', user);
    console.log('UserAvatar_url:', user?.avatar_url);
  }, [user]);

  const handleNavigation = (url: string) => {
    navigate({ to: url });
    closeSearch(); // Close search on mobile after navigation
  };

  const handleRenderDialog = () => {
    setIsCalendarOpen(true); // <-- toggle state instead of returning JSX
  };

  // const isMobile = useBreakpointValue({base: true, md: false})


  return (
    <>
      <Box
        as="header"
        w="100%"
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        position="sticky"
        top="0"
        zIndex="100"
        transition="all 0.2s"
      >
        {/* Main Header Row */}
        <Flex
          px={{ base: 4, md: 6, lg: 8 }}
          py={3}
          align="center"
          minH="60px"
        >
          {/* Mobile Menu Button */}
          <IconButton
            aria-label="Open menu"
            display={{ base: "flex", md: "none" }}
            variant="ghost"
            onClick={() => setDrawerOpen(true)}
            mr={2}
          >
            <IoMenu />
          </IconButton>

          {/* Logo/Branding */}
          <HStack
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            fontWeight="bold"
            letterSpacing="-0.5px"
            cursor="pointer"
            onClick={() => navigate({ to: "/crackmode/docs" })}
            gap={0}
            flex={{ base: "1", md: "0" }}
          >
            <Text color="teal.500">Crack</Text>
            <Text color="orange.400">Mode</Text>
          </HStack>

          {/* Desktop Search */}
          {showFullSearch && (
            <Box flex="1" maxW="600px" mx={6}>
              <DocsSearch
                onNavigate={handleNavigation}
                placeholder="Search Crackmode docs..."
                maxWidth="100%"
                showFilters={true}
              />
            </Box>
          )}

          {/* Tablet Search Icon */}
          {!showFullSearch && !isMobile && (
            <IconButton
              aria-label="Toggle Search"
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              mx={2}
            >
              {isSearchOpen ? <FaTimes /> : <FaSearch />}
            </IconButton>
          )}

          <Spacer />

          {/* User Menu & Controls */}
          <HStack gap={2}>
            {/* Mobile Search Icon */}
            {isMobile && (
              <IconButton
                aria-label="Toggle Search"
                variant="ghost"
                size="sm"
                onClick={toggleSearch}
              >
                {isSearchOpen ? <FaTimes /> : <FaSearch />}
              </IconButton>
            )}

            {page === "crackmode/docs" && (
              <>
                <IconButton
                  variant="plain"
                  onClick={handleRenderDialog}
                  aria-label="Open Calendar"
                >
                  <FaCalendar />
                </IconButton>
                {(isMobile || page === "crackmode/docs") && (
                  <ViewCalendar
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                    page="crackmode/docs"
                  />
                )}
              </>
            )}


            {!isMobile && (
              < ColorModeButton size="sm" />
            )}

            {/* User Menu */}
            {isLoading ? (
              <HStack gap={2} align="center">
                <SkeletonCircle size="8" />
                <SkeletonText noOfLines={1} width="80px" display={{ base: "none", sm: "block" }} />
              </HStack>
            ) : user ? (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" size="sm" disabled={isLoggingOut}>
                    {isLoggingOut ? (
                      <HStack gap={2}>
                        <Spinner size="sm" />
                        <Text display={{ base: "none", sm: "inline" }}>Logging out...</Text>
                      </HStack>
                    ) : (
                      <HStack gap={2}>
                        <Avatar size="sm" name={user.full_name} src={user.avatar_url} />
                        <Text display={{ base: 'none', lg: 'inline' }} fontWeight="medium">
                          {user.full_name}
                        </Text>
                        <FaChevronDown size={10} />
                      </HStack>
                    )}
                  </Button>
                </Menu.Trigger>

                <Menu.Positioner>
                  <Menu.Content
                    bg={bgColor}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    shadow="lg"
                    py={2}
                    minW="180px"
                  >
                    {/* // TODO uncomment once the profile section and onboarding is up and straight */}
                    {/* <Menu.Item
                      value="profile"
                      onSelect={() => navigate({ to: '/dashboard/profile' })}
                      _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                      disabled={isLoggingOut}
                    >
                      Profile
                    </Menu.Item>

                    <Menu.Separator /> */}

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
              <Button
                size="sm"
                onClick={() => navigateWithRedirect('/login')}
                _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                border="1px solid"
                borderColor={borderColor}
              >
                <Text display={{ base: "none", sm: "inline" }}>Get Started for Free</Text>
                <Text display={{ base: "inline", sm: "none" }}>Login</Text>
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Mobile/Tablet Search Row */}
        {!showFullSearch && (
          <Collapsible.Root open={isSearchOpen}>
            <Collapsible.Content>
              <Box
                px={{ base: 4, md: 6 }}
                pb={1}
                // borderTop="1px solid"
                borderColor={borderColor}
              >
                <DocsSearch
                  onNavigate={handleNavigation}
                  placeholder="Search Crackmode docs..."
                  maxWidth="100%"
                  showFilters={true}
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

        )}
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header
                borderBottom="1px solid"
                borderColor={borderColor}
                bg={bgColor}
              >
                <Drawer.Title>
                  <HStack justify="space-between" w="full">
                    <HStack
                      fontSize="xl"
                      fontWeight="bold"
                      letterSpacing="-0.5px"
                      cursor="pointer"
                      onClick={() => {
                        navigate({ to: '/crackmode/docs' });
                        setDrawerOpen(false);
                      }}
                      gap={0}
                    >
                      <Text color={crack}>Crack</Text>
                      <Text color="orange.400">Mode</Text>
                    </HStack>

                    {/* User info in drawer header */}
                    {/* {isLoading ? (
                      <HStack gap={2}>
                        <SkeletonCircle size="6" />
                        <SkeletonText noOfLines={1} width="60px" />
                      </HStack>
                    ) : user ? (
                      <HStack gap={2}>
                        <Avatar size="sm" name={user.full_name} src={user.avatar_url} />
                        <VStack gap={0} align="start">
                          <Text fontSize="sm" fontWeight="medium" lineHeight="1">
                            {user.full_name}
                          </Text>
                          <Button
                            size="xs"
                            color="red.500"
                            onClick={() => {
                              signOut();
                              setDrawerOpen(false);
                            }}
                            disabled={isLoggingOut}
                            p={0}
                            h="auto"
                          >
                            {isLoggingOut ? "Logging out..." : "Logout"}
                          </Button>
                        </VStack>
                      </HStack>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          navigateWithRedirect('/login');
                          setDrawerOpen(false);
                        }}
                      >
                        Login
                      </Button>
                    )} */}
                    <ColorModeButton variant={"surface"}/>
                  </HStack>
                </Drawer.Title>
                <Drawer.CloseTrigger />
              </Drawer.Header>

              <Drawer.Body p={0}>
                <Sidebar />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
};

export default CrackModeHeader;