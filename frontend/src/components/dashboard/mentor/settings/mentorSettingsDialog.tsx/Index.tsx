import { useState, useEffect } from "react";
import { Button, HStack, Tabs, Text } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { LuGlobe, LuCalendar, LuUsers, LuMessageSquare } from "react-icons/lu";
import type { MentorSettingsPublic, MentorSettingsUpdate } from "@/client";

import VisibilityTab from "./tabs/VisibilityTab";
import BookingRulesTab from "./tabs/BookingRulesTab";
import MenteesTab from "./tabs/MenteesTab";
import CommunicationTab from "./tabs/CommunicationTab";
import DeleteAccountDialog from "./tabs/DeleteAccountDialog";
import type { MentorSettingsForm } from "./types";

interface MentorSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: MentorSettingsPublic | null | undefined;
  onSave?: (settings: MentorSettingsUpdate) => void;
  isUpdating: boolean;
}

const MentorSettingsDialog = ({
  isOpen,
  onClose,
  settings,
  onSave,
  isUpdating,
}: MentorSettingsDialogProps) => {
  const [formData, setFormData] = useState<MentorSettingsForm>({
    // Availability & Visibility
    currently_open_to_mentees: true,
    profile_visibility: true,
    allow_public_availability_view: true,

    // Booking Rules
    auto_accept_bookings: true,
    require_intro_message: true,
    booking_buffer_hours: 24,
    session_gap_minutes: 15,
    max_mentees: 5,

    // Communication
    mentorship_philosophy: "",
    ideal_mentee_description: "",
    communication_style: [] as string[],
    response_time_hours: 48,

    // Schedule
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        currently_open_to_mentees: settings.currently_open_to_mentees ?? true,
        profile_visibility: settings.profile_visibility ?? true,
        allow_public_availability_view: settings.allow_public_availability_view ?? true,
        auto_accept_bookings: settings.auto_accept_bookings ?? true,
        require_intro_message: settings.require_intro_message ?? true,
        booking_buffer_hours: settings.booking_buffer_hours ?? 24,
        session_gap_minutes: settings.session_gap_minutes ?? 15,
        max_mentees: settings.max_mentees ?? 5,
        mentorship_philosophy: settings.mentorship_philosophy ?? "",
        ideal_mentee_description: settings.ideal_mentee_description ?? "",
        communication_style: settings.communication_style ?? [],
        response_time_hours: settings.response_time_hours ?? 48,
        timezone: settings.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [settings, isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave?.(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogContent maxH="90vh" display="flex" flexDirection="column">
        <DialogHeader>
          <HStack justify="space-between" w="full">
            <DialogTitle>Mentor Settings</DialogTitle>
            <Text
              fontSize="xs"
              color="red.400"
              cursor="pointer"
              textDecoration="underline"
              onClick={() => setIsDeleteDialogOpen(true)}
              _hover={{ color: "red.600" }}
            >
              Delete my account
            </Text>
          </HStack>
        </DialogHeader>

        <DialogBody flex="1" overflowY="auto">
          <Tabs.Root defaultValue="visibility" variant="enclosed">
            <Tabs.List>
              <Tabs.Trigger value="visibility">
                <LuGlobe /> Visibility
              </Tabs.Trigger>
              <Tabs.Trigger value="booking">
                <LuCalendar /> Booking Rules
              </Tabs.Trigger>
              <Tabs.Trigger value="mentees">
                <LuUsers /> Mentees
              </Tabs.Trigger>
              <Tabs.Trigger value="communication">
                <LuMessageSquare /> Communication
              </Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>

            <Tabs.Content value="visibility">
              <VisibilityTab formData={formData} setFormData={setFormData} />
            </Tabs.Content>

            <Tabs.Content value="booking">
              <BookingRulesTab formData={formData} setFormData={setFormData} />
            </Tabs.Content>

            <Tabs.Content value="mentees">
              <MenteesTab formData={formData} setFormData={setFormData} />
            </Tabs.Content>

            <Tabs.Content value="communication">
              <CommunicationTab formData={formData} setFormData={setFormData} />
            </Tabs.Content>
          </Tabs.Root>
        </DialogBody>

        <DialogFooter borderTopWidth="1px" borderColor="border.muted">
          <HStack justify="space-between" w="full">
            <Button variant="subtle" onClick={onClose} colorPalette="red">
              Cancel
            </Button>
            <Button
              colorPalette="green"
              onClick={handleSubmit}
              loading={isSubmitting || isUpdating}
            >
              Save Settings
            </Button>
          </HStack>
          <DeleteAccountDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
          />
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default MentorSettingsDialog;