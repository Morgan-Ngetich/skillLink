import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaPlus, FaServicestack } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useColorModeValue } from "@/components/ui";
import ServiceCard from "./ServiceCard";
import ServiceFormModal from "./ServiceFormModal";
import { useMentorServices } from "@/hooks/mentor/useMentorServices";
import type { MentorServicePublic } from "@/client";

interface MentorServicesProps {
  serviceModal?: "create" | "edit";
  serviceId?: string;
  onOpenServiceModal: (mode: "create" | "edit", serviceId?: string) => void;
  onCloseServiceModal: () => void;
}

const MentorServices: React.FC<MentorServicesProps> = ({ serviceModal, serviceId, onOpenServiceModal, onCloseServiceModal }) => {
  const { services, isLoading, deleteService } = useMentorServices();
  const [editingService, setEditingService] = useState<MentorServicePublic | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MentorServicePublic | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);

  const borderCol = useColorModeValue("gray.200", "gray.600");

  // Load editing service when URL changes
  useEffect(() => {
    if (serviceModal === "edit" && serviceId && services) {
      const service = services.find((s) => s.uuid === serviceId);
      if (service) {
        setEditingService(service);
      }
    } else if (serviceModal === "create") {
      setEditingService(null);
    }
  }, [serviceModal, serviceId, services]);

  const handleCreate = () => {
    onOpenServiceModal("create");
  };

  const handleEdit = (service: MentorServicePublic) => {
    onOpenServiceModal("edit", service.uuid);
  };

  const handleDelete = (service: MentorServicePublic) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleCloseModal = () => {
    setEditingService(null);
    onCloseServiceModal();
  };

  const handleToggleExpand = (serviceId: number) => {
    setExpandedServiceId(expandedServiceId === serviceId ? null : serviceId);
  };

  if (isLoading) {
    return <Text>Loading services...</Text>;
  }

  const isModalOpen = serviceModal === "create" || serviceModal === "edit";

  if (!services || services.length === 0) {
    return (
      <>
        <Box
          w="full"
          p={8}
          border="1px dashed"
          borderColor={borderCol}
          borderRadius="2xl"
          textAlign="center"
          bg={"cardbg"}
        >
          <Heading size="sm" mb={2}>
            You haven't created any services yet.
          </Heading>
          <Text fontSize="sm" color="fg.muted" mb={4}>
            Start by creating your first mentorship service and showcase your expertise.
          </Text>
          <Button onClick={handleCreate}>
            <FaServicestack />
            Create Service
          </Button>
        </Box>

        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          service={editingService}
        />
      </>
    );
  }

  return (
    <>
      <VStack align="stretch" gap={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="sm">Your Services</Heading>
          <Button size="sm" variant="outline" onClick={handleCreate}>
            <FaPlus />
            Add New Service
          </Button>
        </Box>

        <SimpleGrid columns={2} gap={2}>
          {services.map((service) => (
            <ServiceCard
              key={service.uuid}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isExpanded={expandedServiceId === service.id}
              onToggleExpand={() => handleToggleExpand(service.id)}
            />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Edit/Create Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={editingService}
      />

      {/* Delete Confirmation Dialog */}
      <DialogRoot
        open={isDeleteDialogOpen}
        onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}
        role="alertdialog"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold">
                "{serviceToDelete?.title}"
              </Text>
              ? This action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default MentorServices;