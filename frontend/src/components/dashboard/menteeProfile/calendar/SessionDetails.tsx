import {
  Badge,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Card,
  CloseButton,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { IoTimeSharp, IoVideocam, IoCalendarOutline } from "react-icons/io5"
import { FaClock } from "react-icons/fa6"
import { BiNotepad } from "react-icons/bi"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from "@/components/ui"
import { type MentorshipSession } from "@/client/services/ment"
import { Avatar } from "@/components/ui"

interface SessionDetailsProps {
  isOpen: boolean
  date: string
  sessions: MentorshipSession[]
  onClose: () => void
}

export function SessionDetails({ isOpen, date, sessions, onClose }: SessionDetailsProps) {
  const borderColor = { base: 'gray.200', _dark: 'gray.600' }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getSessionTypeColorScheme = (sessionType: string) => {
    switch (sessionType) {
      case "Career Guidance":
        return "purple"
      case "Technical Review":
        return "blue"
      case "Mock Interview":
        return "red"
      case "Project Review":
        return "teal"
      case "General Discussion":
        return "orange"
      default:
        return "gray"
    }
  }

  const getStatusColorScheme = (status: string) => {
    switch (status) {
      case "scheduled":
        return "yellow"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      case "in-progress":
        return "yellow"
      default:
        return "gray"
    }
  }

  const getDifficultyColorScheme = (difficulty?: string) => {
    switch (difficulty) {
      case "Beginner":
        return "green"
      case "Intermediate":
        return "yellow"
      case "Advanced":
        return "red"
      default:
        return "gray"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    }
    return `${mins}m`
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()} placement={'center'}>
      <DialogContent maxW="3xl" border="1px solid">
        <DialogHeader>
          <VStack align="start" gap={1}>
            <Text fontSize={{ base: "lg", md: "xl" }}>Sessions for {formatDate(date)}</Text>
            <Text fontSize="sm" color={'fg.muted'}>
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
            </Text>
          </VStack>
        </DialogHeader>

        <DialogCloseTrigger asChild >
          <CloseButton onClick={onClose} variant={'surface'} />
        </DialogCloseTrigger>

        <DialogBody maxH={"lg"} overflowY={"auto"}>
          <VStack gap={4}>
            {sessions.map((session) => (
              <Card.Root
                key={session.id}
                w="full"
                bg={'cardbg'}
                borderColor={borderColor}
                borderWidth="1px"
              >
                <Card.Body p={5}>
                  {/* Session Header */}
                  <Flex justify="space-between" align="flex-start" mb={4}>
                    <VStack align="start" gap={2} flex={1}>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" lineClamp={2}>
                        {session.title}
                      </Text>

                      {/* Mentor Info */}
                      <HStack gap={3} justify={'space-between'} align="flex-end" w="full">
                        <HStack>
                          <Avatar name={session.mentorName} src={session.mentorAvatar} />
                          <VStack align="start" gap={0}>
                            <Text fontSize="xs" color={'fg.muted'}>
                              Mentor
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {session.mentorName}
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Session Meta */}
                        <HStack gap={4} wrap="wrap">
                          <HStack gap={1}>
                            <IoCalendarOutline />
                            <Text fontSize="sm">
                              {formatTime(session.scheduledAt)}
                            </Text>
                          </HStack>

                          <HStack gap={1}>
                            <FaClock size="14" />
                            <Text fontSize="sm" color={'fg.muted'}>
                              {formatDuration(session.duration)}
                            </Text>
                          </HStack>
                        </HStack>
                      </HStack>

                    </VStack>

                    {/* Status and Action Buttons */}

                    <HStack gap={2}>
                      <Badge
                        colorPalette={getSessionTypeColorScheme(session.sessionType)}
                        variant="surface"
                        fontSize="xs"
                      >
                        {session.sessionType}
                      </Badge>
                      <Badge
                        colorPalette={getStatusColorScheme(session.status)}
                        variant="surface"
                        fontSize="xs"
                      >
                        {session.status === "scheduled" && "📅"}
                        {session.status === "completed" && "✅"}
                        {session.status === "cancelled" && "❌"}
                        {session.status === "in-progress" && "🔄"}
                        {" "}{session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                      {session.difficulty && (
                        <Badge
                          colorPalette={getDifficultyColorScheme(session.difficulty)}
                          variant="surface"
                          fontSize="xs"
                        >
                          {session.difficulty}
                        </Badge>
                      )}
                    </HStack>
                  </Flex>

                  {/* Topics */}
                  <HStack w="100%" justify={'space-between'} align={'flex-end'}>
                    <VStack align="start" gap={3} mb={4}>
                      <Text fontSize="sm" fontWeight="medium">
                        Topics to Cover:
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        {session.topics.map((topic) => (
                          <Badge key={topic} variant="outline" fontSize="xs" bg={"fg.inverted"} border="1px solid gray">
                            {topic}
                          </Badge>
                        ))}
                      </Flex>
                    </VStack>

                    {/* Action Button */}
                    {session.status === "scheduled" && session.meetingLink && (
                      <Link
                        to={session.meetingLink}
                        target="_blank"
                      >
                        <Button
                          rel="noopener noreferrer"
                          size="sm"
                          colorPalette="blue"
                          variant="surface"
                          _hover={{ border: "1px solid" }}
                        >
                          <IoVideocam />
                          Join Session
                        </Button>
                      </Link>
                    )}
                  </HStack>

                  {/* Session Notes (for completed sessions) */}
                  {session.status === "completed" && session.notes && (
                    <VStack align="start" gap={2}>
                      <HStack gap={2}>
                        <BiNotepad size="16" />
                        <Text fontSize="sm" fontWeight="medium">
                          Session Notes:
                        </Text>
                      </HStack>
                      <Card.Root bg={'gray.50'} _dark={{ bg: 'gray.700' }} w="full">
                        <Card.Body p={3}>
                          <Text fontSize="sm" color={'fg.muted'}>
                            {session.notes}
                          </Text>
                        </Card.Body>
                      </Card.Root>
                    </VStack>
                  )}

                  {/* Completion Time */}
                  {session.status === "completed" && session.completedAt && (
                    <Flex justify="flex-end" mt={3}>
                      <HStack gap={1} fontSize="sm" color={'fg.muted'}>
                        <IoTimeSharp />
                        <Text>Completed at {formatTime(session.completedAt)}</Text>
                      </HStack>
                    </Flex>
                  )}
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}