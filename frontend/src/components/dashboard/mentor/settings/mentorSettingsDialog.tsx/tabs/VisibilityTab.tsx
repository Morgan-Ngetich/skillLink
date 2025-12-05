import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { Switch } from "@/components/ui/switch";
import type { MentorSettingsForm } from "../Index";

interface VisibilityTabProps {
  formData: MentorSettingsForm;
  setFormData: (data: MentorSettingsForm) => void;
}

const VisibilityTab = ({ formData, setFormData }: VisibilityTabProps) => {
  return (
    <VStack align="stretch" gap={6} py={4}>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Profile Visibility
        </Text>

        <VStack align="stretch" gap={6}>
          <HStack justify="space-between">
            <Box flex="1">
              <Text fontWeight="medium">Profile Visible to Public</Text>
              <Text fontSize="sm" color="fg.muted">
                Allow others to view your mentor profile
              </Text>
            </Box>
            <Switch
              checked={formData.profile_visibility}
              onCheckedChange={(e) =>
                setFormData({ ...formData, profile_visibility: e.checked })
              }
              colorPalette="green"
            />
          </HStack>

          <HStack justify="space-between">
            <Box flex="1">
              <Text fontWeight="medium">Currently Open to Mentees</Text>
              <Text fontSize="sm" color="fg.muted">
                Accept new mentorship requests
              </Text>
            </Box>
            <Switch
              checked={formData.currently_open_to_mentees}
              onCheckedChange={(e) =>
                setFormData({ ...formData, currently_open_to_mentees: e.checked })
              }
              colorPalette="green"
            />
          </HStack>

          <HStack justify="space-between">
            <Box flex="1">
              <Text fontWeight="medium">Show Availability Calendar</Text>
              <Text fontSize="sm" color="fg.muted">
                Let mentees see your available time slots
              </Text>
            </Box>
            <Switch
              checked={formData.allow_public_availability_view}
              onCheckedChange={(e) =>
                setFormData({ ...formData, allow_public_availability_view: e.checked })
              }
              colorPalette="green"
            />
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default VisibilityTab;