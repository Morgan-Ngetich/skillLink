import {
  Badge,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Card,
  CloseButton,
  Box,
  Separator,
  Stack,
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
        return "blue"
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
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      placement={{base: "bottom", md: "center"}}
      size={{ base: "", md: "md" }}
    >
      <DialogContent

        h={{ base: "85vh", md: "80vh" }}
        maxW={{ base: "100%", md: "3xl" }}
        m={{ base: 0, md: 4 }}
        borderRadius={{ base: 0, md: "xl" }}
        borderTopRadius={{base: "2xl", md: "xl"}}
      >

        <Box
          mx="36%"
          mt={1}
          mb={-3}
          bg="fg.muted"
          h="7px"
          w="130px"
          borderRadius={'full'}
          onClick={() => onClose()}
        />

        <DialogHeader
          pb={4}
          borderBottom="1px solid"
          borderColor="border.subtle"
        >
          <VStack align="start" gap={1}>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
              {formatDate(date)}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
            </Text>
          </VStack>
        </DialogHeader>

        <DialogCloseTrigger asChild>
          <CloseButton
            onClick={onClose}
            variant="ghost"
            size="sm"
          />
        </DialogCloseTrigger>

        <DialogBody
          overflowY="auto"
          p={{ base: 4, md: 6 }}
        >
          <VStack gap={4} align="stretch">
            {sessions.map((session) => (
              <Card.Root
                key={session.id}
                borderWidth="1px"
                borderColor="border.emphasized"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.2s"
                shadow="md"

              >
                <Card.Body p={{ base: 4, md: 5 }}>
                  {/* Header Section */}
                  <VStack align="stretch" gap={{base: 3, md: 4}}>
                    {/* Title and Badges */}
                    <Stack
                      direction={{ base: "column", md: "row" }}
                      justify="space-between"
                      align={{ base: "start", md: "center" }}
                      gap={3}
                    >
                      <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="semibold"
                        flex={1}
                      >
                        {session.title}
                      </Text>

                      <HStack gap={2} flexWrap="wrap">
                        <Badge
                          colorPalette={getStatusColorScheme(session.status)}
                          variant="subtle"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                        >
                          {session.status === "scheduled" && "📅 "}
                          {session.status === "completed" && "✅ "}
                          {session.status === "cancelled" && "❌ "}
                          {session.status === "in-progress" && "🔄 "}
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                        <Badge
                          colorPalette={getSessionTypeColorScheme(session.sessionType)}
                          variant="subtle"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                        >
                          {session.sessionType}
                        </Badge>
                        {session.difficulty && (
                          <Badge
                            colorPalette={getDifficultyColorScheme(session.difficulty)}
                            variant="outline"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                          >
                            {session.difficulty}
                          </Badge>
                        )}
                      </HStack>
                    </Stack>

                    {/* Mentor Info and Time */}
                    <Stack
                      direction={"row"}
                      justify="space-between"
                      align={{ base: "end", md: "center" }}
                      gap={3}
                    >
                      {/* Mentor */}
                      <HStack gap={3}>
                        <Avatar
                          name={session.mentorName}
                          src={session.mentorAvatar}
                          size={{ base: "sm", md: "md" }}
                        />
                        <VStack align="start" gap={0}>
                          <Text fontSize="xs" color="fg.muted">
                            Mentor
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {session.mentorName}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Time Info */}
                      <HStack
                        gap={4}
                        fontSize="sm"
                        color="fg.muted"
                        flexWrap="wrap"
                      >
                        <HStack gap={1}>
                          <IoCalendarOutline />
                          <Text>{formatTime(session.scheduledAt)}</Text>
                        </HStack>
                        <HStack gap={1}>
                          <FaClock size="14" />
                          <Text>{formatDuration(session.duration)}</Text>
                        </HStack>
                      </HStack>
                    </Stack>

                    <Separator />

                    {/* Topics Section */}
                    <VStack align="start" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                        Topics to Cover
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        {session.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            fontSize="xs"
                            colorPalette="gray"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </Flex>
                    </VStack>

                    {/* Session Notes (for completed) */}
                    {session.status === "completed" && session.notes && (
                      <VStack align="start" gap={2}>
                        <HStack gap={2}>
                          <BiNotepad size="16" />
                          <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                            Session Notes
                          </Text>
                        </HStack>
                        <Box
                          bg="bg.muted"
                          p={3}
                          borderRadius="md"
                          w="full"
                        >
                          <Text fontSize="sm" color="fg.muted">
                            {session.notes}
                          </Text>
                        </Box>
                      </VStack>
                    )}

                    {/* Footer Section */}
                    <Stack
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align={{ base: "stretch", sm: "center" }}
                      gap={3}
                      pt={2}
                    >
                      {/* Completion Time */}
                      {session.status === "completed" && session.completedAt && (
                        <HStack gap={1} fontSize="sm" color="fg.muted">
                          <IoTimeSharp />
                          <Text>Completed at {formatTime(session.completedAt)}</Text>
                        </HStack>
                      )}

                      {/* Join Button */}
                      {session.status === "scheduled" && session.meetingLink && (
                        <Link to={session.meetingLink} target="_blank">
                          <Button
                            size="sm"
                            colorPalette="blue"
                            w={{ base: "full", sm: "auto" }}
                          >
                            <IoVideocam />
                            Join Session
                          </Button>
                        </Link>
                      )}

                      {/* Spacer for layout when no completion time */}
                      {session.status === "scheduled" && !session.completedAt && (
                        <Box display={{ base: "none", sm: "block" }} />
                      )}
                    </Stack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot >
  )
}