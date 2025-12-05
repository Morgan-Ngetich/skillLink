import { Box, VStack, IconButton } from '@chakra-ui/react';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import { NavItem } from './NavItem';
import type { DesktopSidebarProps } from './types';

export const DesktopSidebar = ({ 
  navItems, 
  isOpen, 
  onToggle 
}: DesktopSidebarProps) => {
  return (
    <Box
      as="nav"
      position="relative"
      h="100vh"
      w={isOpen ? '200px' : '72px'}
      borderRight="1px solid"
      borderColor="border.emphasized"
      transition="width 0.3s ease"
      overflowY="auto"
      overflowX="hidden"
      aria-label="Main navigation"
    >
      {/* Toggle Button */}
      <IconButton
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        position="absolute"
        top={4}
        right={4}
        variant="surface"
        size="xs"
        onClick={onToggle}
        zIndex={2}
      >
        {isOpen ? <FaArrowLeftLong /> : <FaArrowRightLong />}
      </IconButton>

      {/* Navigation Items */}
      <VStack gap={0} align="stretch" pt={16}>
        {navItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            isOpen={isOpen}
          />
        ))}
      </VStack>
    </Box>
  );
};