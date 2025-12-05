import type { MentorServicePublic } from '@/client';
import ServicesContent from '@/components/dashboard/mentor/services/ServicesContent';

interface ServicesTabProps {
  services: MentorServicePublic[];
  readOnly?: boolean;
  serviceModal?: "create" | "edit";
  serviceId?: string;
  onOpenServiceModal?: (mode: "create" | "edit", serviceId?: string) => void;
  onCloseServiceModal?: () => void;
  onEdit?: (service: MentorServicePublic) => void;
  onDelete?: (service: MentorServicePublic) => void;
}

/*
 * ServicesTab component is only for mobile view
*/
const ServicesTab = ({
  services,
  readOnly,
  serviceModal,
  serviceId,
  onOpenServiceModal,
  onCloseServiceModal,
  onEdit,
  onDelete,
}: ServicesTabProps) => {
  return (
    <ServicesContent
      services={services}
      readOnly={readOnly}
      serviceModal={serviceModal}
      serviceId={serviceId}
      onOpenServiceModal={onOpenServiceModal}
      onCloseServiceModal={onCloseServiceModal}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default ServicesTab;
