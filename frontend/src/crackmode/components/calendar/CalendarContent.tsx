import { Container, VStack, Text } from "@chakra-ui/react"
import { Calendar } from "./Calendar"
import { ProblemDetails } from "./ProblemDetails"
import { type LeetcodeProblem, mockProblems } from "@/crackmode/types/calendar"

const CalendarContent = ({
  onDateClick,
  selectedDate,
  selectedProblems,
  handleCloseDetails,
}: {
  onDateClick: (date: string) => void
  selectedDate: string | null
  selectedProblems: LeetcodeProblem[]
  handleCloseDetails: () => void
}) => (
  <Container>
    <VStack gap={4}>
      <VStack gap={2} textAlign="center">
        <Text color="gray.600" _dark={{ color: "gray.400" }}>
          Track our daily problem-solving journey
        </Text>
      </VStack>

      <Calendar problems={mockProblems} onDateClick={onDateClick} />

      {selectedDate && (
        <ProblemDetails
          isOpen={!!selectedDate}
          date={selectedDate}
          problems={selectedProblems}
          onClose={handleCloseDetails}
        />
      )}
    </VStack>
  </Container>
)


export default CalendarContent