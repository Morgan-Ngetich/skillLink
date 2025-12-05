import { VStack, Text } from "@chakra-ui/react";
import { Field, StyledInput, StyledTextarea } from "@/components/ui";
import type { MentorSettingsForm } from "../Index";

interface MenteesTabProps {
  formData: MentorSettingsForm;
  setFormData: (data: MentorSettingsForm) => void;
}

const MenteesTab = ({ formData, setFormData }: MenteesTabProps) => {
  return (
    <VStack align="stretch" gap={6} py={4}>
      <Field label="Maximum Active Mentees">
        <StyledInput
          type="number"
          value={formData.max_mentees}
          onChange={(e) =>
            setFormData({
              ...formData,
              max_mentees: parseInt(e.target.value) || 0,
            })
          }
          min={1}
          max={100}
        />
        <Text fontSize="xs" color="fg.muted" mt={1}>
          Maximum number of concurrent mentees (leave 0 for unlimited)
        </Text>
      </Field>

      <Field label="Ideal Mentee Description">
        <StyledTextarea
          value={formData.ideal_mentee_description}
          onChange={(e) =>
            setFormData({
              ...formData,
              ideal_mentee_description: e.target.value,
            })
          }
          placeholder="Describe your ideal mentee (e.g., early-career developers, career switchers...)"
          rows={3}
          maxLength={300}
        />
        <Text fontSize="xs" color="fg.muted" mt={1}>
          {(formData?.ideal_mentee_description ?? "").length}/300 characters
        </Text>
      </Field>

      <Field label="Mentorship Philosophy">
        <StyledTextarea
          value={formData.mentorship_philosophy ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              mentorship_philosophy: e.target.value,
            })
          }
          placeholder="Share your approach to mentorship..."
          rows={4}
          maxLength={500}
        />
        <Text fontSize="xs" color="fg.muted" mt={1}>
          {(formData?.mentorship_philosophy ?? "").length}/500 characters
        </Text>
      </Field>
    </VStack>
  );
};

export default MenteesTab;