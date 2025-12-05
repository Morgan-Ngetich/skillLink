import { Box, HStack } from '@chakra-ui/react';
import { NavItem } from './NavItem';
import type { SidebarProps } from './types';

export const MobileSidebar = ({ navItems }: SidebarProps) => {
  return (
    <Box
      as="nav"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      borderTop="1px solid"
      borderColor="border.subtle"
      bg="bg"
      zIndex="sticky"
      px={2}
      py={2}
      aria-label="Mobile navigation"
    >
      <HStack justify="space-around" align="center" gap={1}>
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} isMobile />
        ))}
      </HStack>
    </Box>
  );
};