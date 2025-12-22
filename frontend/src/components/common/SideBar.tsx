import { useNavItems, useSidebarState } from '@/hooks/sidebar/useSidebar';
import { Box } from '@chakra-ui/react';
import { SidebarSkeleton } from './sidebar/SidebarSkeleton';
import { MobileSidebar } from './sidebar/MobileSidebar';
import { DesktopSidebar } from './sidebar/DesktopSidebar';

const Sidebar = () => {
  const { isOpen, toggle } = useSidebarState();
  const { navItems, isLoading } = useNavItems();

  // Show skeleton during auth loading
  if (isLoading) {
    return (
      <>
        {/* Mobile skeleton - visible on base, hidden on md+ */}
        <Box display={{ base: 'block', md: 'none' }}>
          <SidebarSkeleton isMobile={true} />
        </Box>
        
        {/* Desktop skeleton - hidden on base, visible on md+ */}
        <Box display={{ base: 'none', md: 'block' }}>
          <SidebarSkeleton isMobile={false} />
        </Box>
      </>
    );
  }

  return (
    <>
      {/* Mobile sidebar - visible on base, hidden on md+ */}
      <Box display={{ base: 'block', md: 'none' }}>
        <MobileSidebar navItems={navItems} />
      </Box>
      
      {/* Desktop sidebar - hidden on base, visible on md+ */}
      <Box display={{ base: 'none', md: 'block' }}>
        <DesktopSidebar 
          navItems={navItems} 
          isOpen={isOpen} 
          onToggle={toggle} 
        />
      </Box>
    </>
  );
};

export default Sidebar;