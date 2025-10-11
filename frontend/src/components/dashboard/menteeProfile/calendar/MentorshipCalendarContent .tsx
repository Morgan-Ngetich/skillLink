import { useState } from "react"
import { Container, VStack } from "@chakra-ui/react"
import { MentorshipCalendar } from "./MentorshipCalendar"
import { SessionDetails } from "./SessionDetails"
import { type MentorshipSession, mockSessions } from "@/client/services/ment"

const MentorshipCalendarContent = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<MentorshipSession[]>([])

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setSelectedSessions(mockSessions[date] || [])
  }

  const handleCloseDetails = () => {
    setSelectedDate(null)
    setSelectedSessions([])
  }

  return (
    <Container maxW="4xl" p={0}>
      <VStack gap={6}>
        {/* Quick Stats */}
        {/* <VStack gap={4} textAlign="center">
          <Text fontSize="lg" fontWeight="semibold">
            Session Overview
          </Text>
          <HStack gap={8} wrap="wrap" justify="center">
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {Object.values(mockSessions)
                  .flat()
                  .filter(s => s.status === "scheduled").length}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Upcoming Sessions
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {Object.values(mockSessions)
                  .flat()
                  .filter(s => s.status === "completed").length}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Completed Sessions
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {Object.keys(mockSessions)
                  .filter(date => mockSessions[date].length > 0).length}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Active Days
              </Text>
            </VStack>
          </HStack>
        </VStack> */}

        {/* Calendar */}
        <MentorshipCalendar
          sessions={mockSessions}
          onDateClick={handleDateClick}
        />

        {/* Session Details Modal */}
        {selectedDate && (
          <SessionDetails
            isOpen={!!selectedDate}
            date={selectedDate}
            sessions={selectedSessions}
            onClose={handleCloseDetails}
          />
        )}

      </VStack>
    </Container>
  )
}

export default MentorshipCalendarContent