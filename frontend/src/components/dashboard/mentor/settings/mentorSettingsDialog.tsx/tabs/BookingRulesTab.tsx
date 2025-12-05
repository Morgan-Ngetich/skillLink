import { Box, VStack, HStack, Text, Grid, Separator } from "@chakra-ui/react";
import { Switch } from "@/components/ui/switch";
import { Field, StyledInput } from "@/components/ui";
import type { MentorSettingsForm } from "../Index";

interface BookingRulesTabProps {
  formData: MentorSettingsForm;
  setFormData: (data: MentorSettingsForm) => void;
}

const BookingRulesTab = ({ formData, setFormData }: BookingRulesTabProps) => {
  return (
    <VStack align="stretch" gap={6} py={4}>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Booking Preferences
        </Text>

        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Box flex="1">
              <Text fontWeight="medium">Auto-Accept Bookings</Text>
              <Text fontSize="sm" color="fg.muted">
                Automatically confirm new booking requests
              </Text>
            </Box>
            <Switch
              checked={formData.auto_accept_bookings}
              onCheckedChange={(e) =>
                setFormData({ ...formData, auto_accept_bookings: e.checked })
              }
              colorPalette="green"
            />
          </HStack>

          <HStack justify="space-between">
            <Box flex="1">
              <Text fontWeight="medium">Require Introduction Message</Text>
              <Text fontSize="sm" color="fg.muted">
                Mentees must write a message when booking
              </Text>
            </Box>
            <Switch
              checked={formData.require_intro_message}
              onCheckedChange={(e) =>
                setFormData({ ...formData, require_intro_message: e.checked })
              }
              colorPalette="green"
            />
          </HStack>
        </VStack>
      </Box>

      <Separator />

      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Scheduling Rules
        </Text>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          <Field label="Booking Buffer (hours)">
            <StyledInput
              type="number"
              value={formData.booking_buffer_hours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  booking_buffer_hours: parseInt(e.target.value) || 0,
                })
              }
              min={0}
            />
            <Text fontSize="xs" color="fg.muted" mt={1}>
              Minimum advance notice for bookings
            </Text>
          </Field>

          <Field label="Session Gap (minutes)">
            <StyledInput
              type="number"
              value={formData.session_gap_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  session_gap_minutes: parseInt(e.target.value) || 0,
                })
              }
              min={0}
            />
            <Text fontSize="xs" color="fg.muted" mt={1}>
              Break time between sessions
            </Text>
          </Field>
        </Grid>
      </Box>
    </VStack>
  );
};

export default BookingRulesTab;