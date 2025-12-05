import { useNavItems, useSidebarState } from '@/hooks/sidebar/useSidebar';
import { useBreakpointValue } from '@chakra-ui/react';
import { SidebarSkeleton } from './sidebar/SidebarSkeleton';
import { MobileSidebar } from './sidebar/MobileSidebar';
import { DesktopSidebar } from './sidebar/DesktopSidebar';

const Sidebar = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, toggle } = useSidebarState();
  const { navItems, isLoading } = useNavItems();

  // Show skeleton during auth loading
  if (isLoading) {
    return <SidebarSkeleton isMobile={isMobile} />;
  }

  // Render mobile or desktop version
  if (isMobile) {
    return <MobileSidebar navItems={navItems} />;
  }

  return (
    <DesktopSidebar 
      navItems={navItems} 
      isOpen={isOpen} 
      onToggle={toggle} 
    />
  );
};

export default Sidebar;