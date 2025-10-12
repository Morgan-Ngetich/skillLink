import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  Text,
  Grid,
  Flex,
  HStack,
  VStack,
  Card,
  CloseButton,
} from "@chakra-ui/react"
import { Tooltip } from "@/components/ui"
import type { MentorshipSession, SessionFilterType } from "@/client/services/ment";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6"

interface MentorshipCalendarProps {
  sessions: Record<string, MentorshipSession[]>
  onDateClick: (dateString: string) => void
}

export const MentorshipCalendar: React.FC<MentorshipCalendarProps> = ({ sessions, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState<SessionFilterType>("all")

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Color mode values
  const cardBg = { base: 'gray.300', _dark: 'blackAlpha.950' }
  // const cardHoverBg = { base: 'gray.50', _dark: 'gray.700' }
  // const borderColor = { base: 'gray.200', _dark: 'gray.600' }
  const textColor = { base: 'gray.800', _dark: 'gray.100' }
  const mutedTextColor = { base: 'gray.600', _dark: 'gray.400' }
  const todayRingColor = { base: 'blue.500', _dark: 'blue.300' }

  // Calculate date bounds based on session data
  const { earliestDate, latestDate } = useMemo(() => {
    const dates = Object.keys(sessions)
      .filter(date => sessions[date].length > 0)
      .map(date => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime())

    return {
      earliestDate: dates.length > 0 ? dates[0] : null,
      latestDate: dates.length > 0 ? dates[dates.length - 1] : null
    }
  }, [sessions])

  // Initialize current date to today or the earliest session date
  useEffect(() => {
    const now = new Date()
    if (earliestDate && latestDate) {
      // If today is within the range, use today, otherwise use the earliest date
      if (now >= earliestDate && now <= latestDate) {
        setCurrentDate(now)
      } else {
        setCurrentDate(earliestDate)
      }
    }
  }, [earliestDate, latestDate])

  // Check if navigation is allowed
  const canNavigatePrev = useMemo(() => {
    if (!earliestDate) return false
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    return prevMonth >= new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1)
  }, [earliestDate, currentDate])

  const canNavigateNext = useMemo(() => {
    if (!latestDate) return false

    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)
    nextMonth.setHours(0, 0, 0, 0)

    const latestAllowed = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1)
    latestAllowed.setHours(0, 0, 0, 0)

    return nextMonth <= latestAllowed
  }, [latestDate, currentDate])

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev" && !canNavigatePrev) return
    if (direction === "next" && !canNavigateNext) return

    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  const formatDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getDaySessions = (day: number) => {
    const dateString = formatDateString(day)
    const allSessions = sessions[dateString] || []

    if (filter === "all") return allSessions
    return allSessions.filter(session => session.status === filter)
  }

  const getFilteredSessions = (dateString: string, filterType: SessionFilterType) => {
    const allSessions = sessions[dateString] || []
    if (filterType === "all") return allSessions
    return allSessions.filter(session => session.status === filterType)
  }

  const handleLegendClick = (filterType: SessionFilterType) => {
    if (filter === filterType) {
      setFilter("all")
      return
    }

    setFilter(filterType)

    const matchingDates = Object.keys(sessions)
      .filter(dateString => {
        const filteredSessions = getFilteredSessions(dateString, filterType)
        return filteredSessions.length > 0
      })
      .map(dateString => new Date(dateString))

    if (matchingDates.length > 0) {
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const closestDate = matchingDates.reduce((closest, date) => {
        const currentDiff = Math.abs(date.getTime() - currentMonthStart.getTime())
        const closestDiff = Math.abs(closest.getTime() - currentMonthStart.getTime())
        return currentDiff < closestDiff ? date : closest
      })
      setCurrentDate(closestDate)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "orange"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getDiagonalPattern = (status: string) => {
    // const color = getStatusColor(status)
    const colorValue = status === "scheduled" ? "255, 165, 0" : status === "completed" ? "34, 197, 94" : "239, 68, 68"

    return `repeating-linear-gradient(
      45deg,
      rgba(${colorValue}, 0.3) 0px,
      rgba(${colorValue}, 0.3) 2px,
      transparent 2px,
      transparent 8px
    )`
  }

  const renderCalendarDays = () => {
    const days = []

    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<Box key={`empty-${i}`} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(day)
      const daySessions = getDaySessions(day)
      // const allDaySessions = sessions[dateString] || []
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
      const hasSessions = daySessions.length > 0

      // Get the first session's banner and status for display
      const displaySession = daySessions[0]
      const bannerImage = displaySession?.banner
      const sessionStatus = displaySession?.status

      days.push(
        <Card.Root
          key={day}
          bg={bannerImage ? "transparent" : cardBg}
          // bgImage={bannerImage ? `url(${bannerImage})` : undefined}
          bgSize="cover"
          // bgPosition="center"
          border="1px solid"
          borderWidth={isToday ? '2px' : '1px'}
          borderColor={isToday ? todayRingColor : "gray.600"}
          cursor={hasSessions ? 'pointer' : 'default'}
          transition="all 0.2s"
          position="relative"
          overflow="hidden"
          opacity={hasSessions ? 1 : 0.3}
          _hover={hasSessions ? {
            transform: 'scale(1.05)',
            boxShadow: 'md',
            bgImage: bannerImage ? `url(${bannerImage})` : undefined,
          } : {}}
          onClick={() => hasSessions && onDateClick(dateString)}
        >
          {/* Diagonal pattern overlay */}
          {hasSessions && sessionStatus && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgImage={getDiagonalPattern(sessionStatus)}
              pointerEvents="none"
            />
          )}

          {/* Dark overlay for better text readability */}
          {hasSessions && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              // bg={displaySession?.status === "completed" || displaySession?.status === "cancelled"
              //   ? ""
              //   : ""}

              pointerEvents="none"
            />
          )}

          <Card.Body px={1.5} pt={1.5} pb={{base: 1, md: 1.5}} position="relative" zIndex={1}>
            <Flex direction="column" justify="space-between" h="full" minH={"30px"}>

              <Text
                fontSize="sm"
                fontWeight={isToday ? "bold" : "medium"}
                color={hasSessions ? "" : (isToday ? todayRingColor : textColor)}
              >
                {day}
              </Text>
              {daySessions.length > 1 && (
                <Box
                  position={"absolute"}
                  top={0.5}
                  right={0.5}
                >
                  <Text
                    fontSize="9px"
                    fontWeight="bold"
                    color="white"
                    bg={{ base: "blackAlpha.600", _dark: "whiteAlpha.600" }}
                    px={"3px"}
                    py={0}
                    borderRadius="xs"
                    textShadow="0 1px 2px rgba(0,0,0,0.5)"
                  >
                    {daySessions.length}
                  </Text>
                </Box>
              )}


              {hasSessions && daySessions && (
                <Tooltip
                  content={daySessions.map(p => p.title).join(', ')}
                  positioning={{ placement: "top", offset: { mainAxis: 2, crossAxis: 2 } }}
                  disabled={!hasSessions}
                >
                  <HStack gap={1}>
                    {daySessions.map((session, idx) => (
                      <Box
                        key={idx}
                        h="10px"
                        w="10px"
                        bgImage={`url(${session.banner})`}
                        bgSize="cover"
                        bgPos="center"
                        borderRadius="xs"
                        outline="1px solid"
                      />
                    ))}
                  </HStack>
                </Tooltip>
              )}
            </Flex>
          </Card.Body>
        </Card.Root>
      )
    }

    return days
  }

  return (
    <Card.Root bg={{ base: 'white', _dark: 'gray.800' }} borderColor={"gray.600"}>
      <Card.Body p={2}>
        <Box p={5}>
          <Flex justify="space-between" align="center" mb={filter === "all" ? 6 : 0}>
            <Button
              variant="surface"
              size="sm"
              onClick={() => navigateMonth("prev")}
              borderRadius="md"
              disabled={!canNavigatePrev}
              cursor={canNavigatePrev ? "pointer" : "not-allowed"}
            >
              <FaAngleLeft />
            </Button>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {monthNames[month]} {year}
            </Text>
            <Button
              variant="surface"
              size="sm"
              onClick={() => navigateMonth("next")}
              borderRadius="md"
              disabled={!canNavigateNext}
              cursor={canNavigateNext ? "pointer" : "not-allowed"}
            >
              <FaAngleRight />
            </Button>
          </Flex>

          {filter !== "all" && (
            <Box textAlign="center" p={0} mb={-2}>
              <HStack justify="center">
                <Text fontSize="xs" color={mutedTextColor}>
                  Showing:{" "}
                  <Text
                    as="span"
                    color={`${getStatusColor(filter)}.500`}
                    fontWeight="medium"
                  >
                    {filter}
                  </Text>
                  {" "}Sessions
                </Text>
                <CloseButton
                  size="xs"
                  onClick={() => setFilter("all")}
                  variant="surface"
                />
              </HStack>
            </Box>
          )}

          <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={4}>
            {weekdays.map((day) => (
              <Box key={day} textAlign="center" p={2}>
                <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>
                  {day}
                </Text>
              </Box>
            ))}
          </Grid>

          <Grid templateColumns="repeat(7, 1fr)" gap={2}>
            {renderCalendarDays()}
          </Grid>
        </Box>

        <VStack gap={3} mt={4}>
          <HStack
            justify="center"
            gap={6}
            fontSize="sm"
            color="fg.muted"
            wrap="wrap"
          >
            <HStack
              gap={2}
              cursor="pointer"
              onClick={() => handleLegendClick("scheduled")}
              opacity={filter === "scheduled" ? 1 : filter === "all" ? 1 : 0.5}
              transform={filter === "scheduled" ? "scale(1.1)" : "scale(1)"}
              transition="all 0.2s"
            >
              <Box
                w={4}
                h={4}
                outline={"1px solid"}
                borderRadius="sm"
                bgImage={getDiagonalPattern("scheduled")}
              />
              <Text fontSize="xs">Scheduled</Text>
            </HStack>
            <HStack
              gap={2}
              cursor="pointer"
              onClick={() => handleLegendClick("completed")}
              opacity={filter === "completed" ? 1 : filter === "all" ? 1 : 0.5}
              transform={filter === "completed" ? "scale(1.1)" : "scale(1)"}
              transition="all 0.2s"
            >
              <Box
                w={4}
                h={4}
                outline={"1px solid"}
                borderRadius="sm"
                bgImage={getDiagonalPattern("completed")}
              />
              <Text fontSize="xs">Completed</Text>
            </HStack>
            <HStack
              gap={2}
              cursor="pointer"
              onClick={() => handleLegendClick("cancelled")}
              opacity={filter === "cancelled" ? 1 : filter === "all" ? 1 : 0.5}
              transform={filter === "cancelled" ? "scale(1.1)" : "scale(1)"}
              transition="all 0.2s"
            >
              <Box
                w={4}
                h={4}
                 outline={"1px solid"}
                borderRadius="sm"
                bgImage={getDiagonalPattern("cancelled")}
                pointerEvents={"none"}
              />
              <Text fontSize="xs">Cancelled</Text>
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}