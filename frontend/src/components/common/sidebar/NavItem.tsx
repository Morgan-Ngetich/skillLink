import { Button, VStack, Icon, Text, Badge } from '@chakra-ui/react';
import { Link, useRouterState } from '@tanstack/react-router';
import type { NavItemProps } from './types';

export const NavItem = ({ item, isOpen = false, isMobile = false }: NavItemProps) => {
  const router = useRouterState();

  // Check if current route matches this nav item
  const isActive = router.location.pathname === item.to ||
    (item.params && router.location.pathname.includes(item.params.id));

  if (isMobile) {
    return (
      <Link
        to={item.to}
        params={item.params}
        search={item.search}
        style={{ flex: 1 }}
      >
        <VStack
          gap={0}
          flex="1"
          cursor="pointer"
          position="relative"
          p={0}
          borderTopRadius="full"
          transition="all 0.2s"
        >
          <Icon
            as={item.icon}
            boxSize={6}
            color={isActive ? 'fg.emphasized' : 'fg.muted'}
          />
          <Text
            fontSize="2xs"
            mt={1}
            color={isActive ? 'fg.emphasized' : 'fg.muted'}
            fontWeight={isActive ? 'semibold' : 'normal'}
          >
            {item.label}
          </Text>

          {item.badge && (
            <Badge
              position="absolute"
              top={0}
              right={2}
              size="xs"
              variant="solid"
              borderRadius="full"
            >
              {item.badge}
            </Badge>
          )}
        </VStack>
      </Link>
    );
  }

  // Desktop version
  return (
    <Link to={item.to} params={item.params} search={item.search}>
      <Button
        variant="ghost"
        justifyContent={isOpen ? 'flex-start' : 'center'}
        px={isOpen ? 6 : 4}
        py={6}
        borderRadius="0"
        w="full"
        position="relative"
        bg={isActive ? 'bg.muted' : 'transparent'}
        fontWeight={isActive ? 'semibold' : 'normal'}
        _hover={{ bg: 'bg.muted' }}
        _active={{ bg: 'bg.emphasized' }}
      >
        <Icon
          as={item.icon}
          boxSize={6}
          color={isActive ? 'fg.emphasized' : 'fg.muted'}
        />

        {isOpen && (
          <>
            <Text
              ml={4}
              fontSize="sm"
              color={isActive ? 'fg.emphasized' : 'fg'}
            >
              {item.label}
            </Text>

            {item.badge && (
              <Badge
                ml="auto"
                size="xs"
                colorPalette="red"
                variant="solid"
                borderRadius="full"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}

        {!isOpen && item.badge && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            size="xs"
            colorPalette="red"
            variant="solid"
            borderRadius="full"
          >
            {item.badge}
          </Badge>
        )}
      </Button>
    </Link>
  );
};