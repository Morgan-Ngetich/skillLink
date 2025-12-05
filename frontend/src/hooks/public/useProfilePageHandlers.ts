import type { MentorServicePublic, MentorSessionPublic, MentorSettingsPublic, MentorSettingsUpdate } from "@/client";

interface UseProfilePageHandlersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search: any;
  // Session delete
  setIsDeleteSessionDialogOpen: (open: boolean) => void;
  sessionToDelete: MentorSessionPublic | null;
  setSessionToDelete: (session: MentorSessionPublic | null) => void;
  deleteSession: (id: number) => void;
  // Service delete
  setIsDeleteServiceDialogOpen: (open: boolean) => void;
  serviceToDelete: MentorServicePublic | null;
  setServiceToDelete: (service: MentorServicePublic | null) => void;
  deleteService: (id: number) => void;
  // Settings
  updateSettingsAsync?: (settings: MentorSettingsUpdate) => Promise<MentorSettingsPublic>;
}


export const useProfilePageHandlers = ({
  router,
  search,
  setIsDeleteSessionDialogOpen,
  sessionToDelete,
  setSessionToDelete,
  deleteSession,
  setIsDeleteServiceDialogOpen,
  serviceToDelete,
  setServiceToDelete,
  deleteService,
  updateSettingsAsync,
}: UseProfilePageHandlersProps) => {
  const currentRoute = ".";

  // MODAL HANDLERS
  const openModal = (drawer: string, step?: string) => {
    router.navigate({
      to: currentRoute,
      search: { ...search, drawer, step },
      replace: false,
    });
  };

  const closeModal = () => {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { drawer, step, ...rest } = search;
    router.navigate({
      to: currentRoute,
      search: rest,
      replace: true,
    });
  };

  // SERVICE MODAL HANDLERS
  const openServiceModal = (mode: "create" | "edit", serviceId?: string) => {
    router.navigate({
      to: currentRoute,
      search: {
        ...search,
        serviceModal: mode,
        ...(serviceId && { serviceId }),
      },
      replace: false,
    });
  };

  const closeServiceModal = () => {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { serviceModal, serviceId, ...rest } = search;
    router.navigate({
      to: currentRoute,
      search: rest,
      replace: true,
    });
  };

  // SESSION MODAL HANDLERS
  const openSessionModal = (mode: "create" | "edit", sessionId?: string) => {
    router.navigate({
      to: currentRoute,
      search: {
        ...search,
        sessionModal: mode,
        ...(sessionId && { sessionId }),
      },
      replace: false,
    });
  };

  const closeSessionModal = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sessionModal, sessionId, ...rest } = search;
    router.navigate({
      to: currentRoute,
      search: rest,
      replace: true,
    });
  };

  // SESSION DETAIL MODAL HANDLERS
  const openSessionDetailModal = (sessionId: string) => {
    router.navigate({
      to: currentRoute,
      search: {
        ...search,
        sessionDetailId: sessionId,
      },
      replace: false,
    });
  };

  const closeSessionDetailModal = () => {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sessionDetailId, ...rest } = search;
    router.navigate({
      to: currentRoute,
      search: rest,
      replace: true,
    });
  };

  // SESSION ACTION HANDLERS
  const handleSessionEdit = (session: MentorSessionPublic) => {
    openSessionModal("edit", session.uuid);
  };

  const handleSessionDelete = (session: MentorSessionPublic) => {
    setSessionToDelete(session);
    setIsDeleteSessionDialogOpen(true);
  };

  const handleSessionViewDetails = (session: MentorSessionPublic) => {
    openSessionDetailModal(session.uuid);
  };

  const confirmSessionDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setIsDeleteSessionDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const cancelSessionDelete = () => {
    setIsDeleteSessionDialogOpen(false);
    setSessionToDelete(null);
  };

  // SERVICE ACTION HANDLERS
  const handleServiceEdit = (service: MentorServicePublic) => {
    openServiceModal("edit", service.uuid);
  };

  const handleServiceDelete = (service: MentorServicePublic) => {
    setServiceToDelete(service);
    setIsDeleteServiceDialogOpen(true);
  };

  const confirmServiceDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id);
      setIsDeleteServiceDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const cancelServiceDelete = () => {
    setIsDeleteServiceDialogOpen(false);
    setServiceToDelete(null);
  };

  // TAB HANDLERS
  const handleProfileTabChange = (pt: string) => {
    router.navigate({
      to: currentRoute,
      search: { ...search, pt },
      replace: false,
    });
  };

  const handleSidebarTabChange = (st: string) => {
    router.navigate({
      to: currentRoute,
      search: { ...search, st },
      replace: false,
    });
  };

  // SETTINGS HANDLERS
  const handleOpenSettings = () => {
    router.navigate({
      to: currentRoute,
      search: { ...search, settings: "open" },
      replace: false,
    });
  };

  const handleCloseSettings = () => {
    router.navigate({
      to: currentRoute,
      search: { ...search, settings: undefined },
    });
  };

  const handleSaveSettings = async (newSettings: MentorSettingsUpdate) => {
    await updateSettingsAsync!(newSettings);
    handleCloseSettings();
  };

  return {
    // Modal handlers
    openModal,
    closeModal,
    // Service handlers
    openServiceModal,
    closeServiceModal,
    handleServiceEdit,
    handleServiceDelete,
    confirmServiceDelete,
    cancelServiceDelete,
    // Session handlers
    openSessionModal,
    closeSessionModal,
    handleSessionEdit,
    handleSessionDelete,
    confirmSessionDelete,
    cancelSessionDelete,
    openSessionDetailModal,
    closeSessionDetailModal,
    handleSessionViewDetails,
    // Tab handlers
    handleProfileTabChange,
    handleSidebarTabChange,
    // Settings handlers
    handleOpenSettings,
    handleCloseSettings,
    handleSaveSettings,
  };
};