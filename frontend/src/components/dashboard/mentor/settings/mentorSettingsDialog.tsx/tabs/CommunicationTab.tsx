import { VStack, HStack, Text, Box, SimpleGrid } from "@chakra-ui/react";
import { Field, StyledInput } from "@/components/ui";
import type { MentorSettingsForm } from "../Index";

interface CommunicationTabProps {
  formData: MentorSettingsForm;
  // This is because of setFormData(prev => ({ ...prev }))
  setFormData: React.Dispatch<React.SetStateAction<MentorSettingsForm>>;
}

const COMMUNICATION_STYLES = [
  "Direct & Candid",
  "Supportive & Encouraging",
  "Analytical & Detailed",
  "Casual & Friendly",
  "Structured & Organized",
];

const CommunicationTab = ({ formData, setFormData }: CommunicationTabProps) => {
  const toggleCommunicationStyle = (style: string) => {
    setFormData(prev => {
      const styles = prev.communication_style ?? [];

      const updated = styles.includes(style)
        ? styles.filter(s => s !== style)
        : [...styles, style];

      return {
        ...prev,
        communication_style: updated,
      };
    });
  };

  const styles = formData.communication_style ?? [];

  return (
    <VStack align="stretch" gap={6} py={4}>
      <Field label="Communication Style">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
          {COMMUNICATION_STYLES.map((style) => (
            <HStack
              key={style}
              p={3}
              bg={
                styles.includes(style)
                  ? "green.50"
                  : "bg.muted"
              }
              _dark={{
                bg: styles.includes(style)
                  ? "green.900"
                  : "gray.800",
              }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={
                styles.includes(style)
                  ? "green.500"
                  : "border.muted"
              }
              cursor="pointer"
              onClick={() => toggleCommunicationStyle(style)}
              transition="all 0.2s"
              _hover={{ bg: "bg.subtle" }}
            >
              <Box
                w={4}
                h={4}
                borderRadius="sm"
                borderWidth="2px"
                borderColor={
                  styles.includes(style)
                    ? "green.500"
                    : "gray.400"
                }
                bg={
                  styles.includes(style)
                    ? "green.500"
                    : "transparent"
                }
              />
              <Text fontSize="sm">{style}</Text>
            </HStack>
          ))}
        </SimpleGrid>
        <Text fontSize="xs" color="fg.muted" mt={2}>
          Select all that apply
        </Text>
      </Field>

      <Field label="Typical Response Time">
        <HStack>
          <StyledInput
            type="number"
            value={formData.response_time_hours}
            onChange={(e) =>
              setFormData({
                ...formData,
                response_time_hours: parseInt(e.target.value) || 0,
              })
            }
            min={1}
            maxW={{ base: "full", md: "300px" }}
          />
          <Text fontSize="sm" color="fg.muted">
            hours
          </Text>
        </HStack>
        <Text fontSize="xs" color="fg.muted" mt={1}>
          How quickly you typically respond to messages
        </Text>
      </Field>

      <Field label="Timezone">
        <StyledInput
          value={formData.timezone}
          onChange={(e) =>
            setFormData({ ...formData, timezone: e.target.value })
          }
          placeholder="e.g., America/New_York"
        />
        <Text fontSize="xs" color="fg.muted" mt={1}>
          Your preferred timezone for scheduling
        </Text>
      </Field>
    </VStack>
  );
};

export default CommunicationTab;