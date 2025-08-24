// stores/sidebarStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  expandedSections: Record<string, boolean>
  expandedLinks: Record<string, boolean>
  isOpen: boolean
  setExpandedSections: (sections: Record<string, boolean>) => void
  toggleSection: (sectionTitle: string) => void
  setExpandedLinks: (links: Record<string, boolean>) => void
  toggleLink: (linkTitle: string) => void
  setIsOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      expandedSections: {},
      expandedLinks: {},
      isOpen: true,
      setExpandedSections: (sections) => set({ expandedSections: sections }),
      toggleSection: (sectionTitle) =>
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [sectionTitle]: !state.expandedSections[sectionTitle],
          },
        })),
      setExpandedLinks: (links) => set({ expandedLinks: links }),
      toggleLink: (linkTitle) =>
        set((state) => ({
          expandedLinks: {
            ...state.expandedLinks,
            [linkTitle]: !state.expandedLinks[linkTitle],
          },
        })),
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'sidebar-storage', // unique name for localStorage key
      partialize: (state) => ({
        expandedSections: state.expandedSections,
        expandedLinks: state.expandedLinks,
        isOpen: state.isOpen,
      }),
    }
  )
)