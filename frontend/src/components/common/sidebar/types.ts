import type { IconType } from 'react-icons';

export interface NavItemConfig {
  label: string;
  icon: IconType;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | boolean>;
  badge?: string | number;
  requiredAuth?: boolean;
  requiredMentor?: boolean;
}

export interface SidebarProps {
  navItems: NavItemConfig[];
}

export interface DesktopSidebarProps extends SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface NavItemProps {
  item: NavItemConfig;
  isOpen?: boolean;
  isMobile?: boolean;
}