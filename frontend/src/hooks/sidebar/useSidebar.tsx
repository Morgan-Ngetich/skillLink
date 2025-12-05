import { useState, useMemo } from 'react';
import { FiHome, FiSettings, FiUser, FiCompass } from 'react-icons/fi';
import { useAuth } from '@/hooks/auth/useAuth';
import type { NavItemConfig } from '@/components/common/sidebar/types';

const SIDEBAR_STORAGE_KEY = 'sidebar-open';

export const useSidebarState = () => {
  const [isOpen, setIsOpen] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  const toggle = () => {
    setIsOpen((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  return { isOpen, toggle };
};


export const useNavItems = () => {
  const { user, isLoading } = useAuth();

  const navItems = useMemo<NavItemConfig[]>(() => {
    if (isLoading) {
      return [];
    }

    const items: NavItemConfig[] = [
      { 
        label: 'Home', 
        icon: FiHome, 
        to: '/',
      },
      { 
        label: 'Explore', 
        icon: FiCompass, 
        to: '/explore',
      },
    ];

    // Add profile link for authenticated users
    if (user) {
      items.push({
        label: 'Profile',
        icon: FiUser,
        to: '/profile/$id',
        params: { id: user.uuid },
        requiredAuth: true,
      });
    }

    // Add settings for mentors
    if (user?.is_mentor) {
      items.push({
        label: 'Settings',
        icon: FiSettings,
        to: '/profile/$id',
        params: { id: user.uuid },
        search: {
          pt: 'about',
          st: 'services',
          settings: 'open',
        },
        requiredAuth: true,
        requiredMentor: true,
      });
    }

    return items;
  }, [isLoading, user]);

  return { navItems, isLoading };
};