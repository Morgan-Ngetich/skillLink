import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  Text,
  Grid,
  Flex,
  HStack,
  Card,
  CloseButton,
} from "@chakra-ui/react"
import { Tooltip } from "@/components/ui"
import type { LeetcodeProblem } from "@/crackmode/types/calendar"
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { type FilterType } from "@/crackmode/types/calendar";

interface CalendarProps {
  problems: Record<string, LeetcodeProblem[]>
  onDateClick: (dateString: string) => void
}

export const Calendar: React.FC<CalendarProps> = ({ problems, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState<FilterType>("all")

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
  const cardBg = { base: 'white', _dark: 'gray.800' }
  const cardHoverBg = { base: 'gray.50', _dark: 'gray.700' }
  const borderColor = { base: 'gray.200', _dark: 'gray.600' }
  const textColor = { base: 'gray.800', _dark: 'gray.100' }
  const mutedTextColor = { base: 'gray.600', _dark: 'gray.400' }
  const todayRingColor = { base: 'blue.500', _dark: 'blue.300' }

  // Calculate date bounds based on problem data
  const { earliestDate, latestDate } = useMemo(() => {
    const dates = Object.keys(problems)
      .filter(date => problems[date].length > 0)
      .map(date => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime())

    return {
      earliestDate: dates.length > 0 ? dates[0] : null,
      latestDate: dates.length > 0 ? dates[dates.length - 1] : null
    }
  }, [problems])

  // initialize current date to the latest problem date on mount
  useEffect(() => {
    if (latestDate) {
      setCurrentDate(latestDate)
    }
  }, [latestDate])

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

  const getDayProblems = (day: number) => {
    const dateString = formatDateString(day)
    const allProblems = problems[dateString] || []

    // Apply filter
    switch (filter) {
      case "Easy":
      case "Medium":
      case "Hard":
        return allProblems.filter(problem => problem.difficulty === filter)
      case "solved":
        return allProblems.filter(problem => problem.solved)
      default:
        return allProblems
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "green"
      case "Medium":
        return "yellow"
      case "Hard":
        return "red"
      case "solved":
        return "blue"
      default:
        return "gray"
    }
  }

  // Helper function to get filtered problems for any date and filter
  const getFilteredProblems = (dateString: string, filterType: FilterType) => {
    const allProblems = problems[dateString] || []

    switch (filterType) {
      case "Easy":
      case "Medium":
      case "Hard":
        return allProblems.filter(problem => problem.difficulty === filterType)
      case "solved":
        return allProblems.filter(problem => problem.solved)
      default:
        return allProblems
    }
  }

  const handleLegendClick = (filterType: FilterType) => {
    if (filter === filterType) {
      setFilter("all")
      return
    }

    setFilter(filterType)

    // Find dates that have problems matching the filter
    const matchingDates = Object.keys(problems)
      .filter(dateString => {
        const filteredProblems = getFilteredProblems(dateString, filterType)
        return filteredProblems.length > 0
      })
      .map(dateString => new Date(dateString))

    if (matchingDates.length > 0) {
      // Find the closest date to current view
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const closestDate = matchingDates.reduce((closest, date) => {
        const currentDiff = Math.abs(date.getTime() - currentMonthStart.getTime())
        const closestDiff = Math.abs(closest.getTime() - currentMonthStart.getTime())
        return currentDiff < closestDiff ? date : closest
      })

      setCurrentDate(closestDate)
    }
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<Box key={`empty-${i}`} />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(day)
      const dayProblems = getDayProblems(day)
      const allDayProblems = problems[dateString] || []
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
      const hasSolvedProblems = allDayProblems.some((p) => p.solved)
      const hasProblems = dayProblems.length > 0

      days.push(
        <Tooltip
          content={allDayProblems?.map(p => p.title).join(', ')}
          positioning={{ placement: "top", offset: { mainAxis: 2, crossAxis: 2 } }}
          disabled={!hasProblems}
        >
          <Card.Root
            key={day}
            bg={'cardbg'}
            border="1px solid"
            borderWidth={isToday ? "2px" : "1px"}
            borderColor={isToday ? todayRingColor : borderColor}
            cursor={hasProblems ? "pointer" : "default"}
            transition="all 0.2s"
            _hover={
              hasProblems
                ? {
                  bg: cardHoverBg,
                  transform: "scale(1.05)",
                  boxShadow: "md",
                }
                : {
                  bg: cardHoverBg
                }
            }
            onClick={() => hasProblems && onDateClick(dateString)}
            position={'relative'}
            opacity={hasProblems ? 1 : 0.6}
          >
            <Card.Body p={2} textAlign={'center'}>
              <Flex direction="column" justify="space-between" h="full">
                <Flex justify="space-between" align="flex-start">
                  <Text
                    fontSize="sm"
                    fontWeight={isToday ? "bold" : "medium"}
                    color={isToday ? todayRingColor : textColor}
                  >
                    {day}
                  </Text>
                  {hasSolvedProblems && filter !== "solved" && (
                    <Box position={"absolute"} right={1} top={1} w={2} h={2} bg={todayRingColor} borderRadius="full" />
                  )}
                </Flex>

                {hasProblems && (
                  <Flex wrap="wrap" gap={1}>
                    {dayProblems.slice(0, 2).map((problem, index) => (
                      <Box
                        key={index}
                        w={2}
                        h={2}
                        bg={filter === "solved" ? todayRingColor : `${getDifficultyColor(problem.difficulty)}.500`}
                        borderRadius="xs"
                        opacity={1}
                      />
                    ))}
                    {dayProblems.length > 2 && (
                      <Box
                        position={"absolute"}
                        top={{ base: "35%", md: "45%" }}
                        right={{ base: "2px", md: 1 }}
                      >
                        <Text fontSize="2xs">
                          +{dayProblems.length - 2}
                        </Text>
                      </Box>
                    )}
                  </Flex>
                )}
              </Flex>
            </Card.Body>
          </Card.Root>
        </Tooltip>
      )
    }

    return days
  }


  return (
    <Card.Root bg={cardBg} borderColor={"gray.600"}>
      <Card.Body p={6}>
        {/* Calendar Header */}
        <Flex justify="space-between" align="center" mb={filter === "all" ? 6 : 2}>
          <Button
            variant={"surface"}
            size="sm"
            onClick={() => navigateMonth("prev")}
            borderRadius={"md"}
            _hover={{ border: "1px solid" }}
            disabled={!canNavigatePrev}
            cursor={canNavigatePrev ? "pointer" : "not-allowed"}
          >
            <FaAngleLeft />
          </Button>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {monthNames[month]} {year}
          </Text>
          <Button
            variant={"surface"}
            size="sm"
            onClick={() => navigateMonth("next")}
            borderRadius={"md"}
            _hover={{ border: "1px solid" }}
            disabled={!canNavigateNext}
            cursor={canNavigateNext ? "pointer" : "not-allowed"}
          >
            <FaAngleRight />
          </Button>
        </Flex>

        {/* Filter Status */}
        {filter !== "all" && (
          <Box textAlign="center" p={0}>
            <HStack justify="center">
              <Text fontSize="xs" color={mutedTextColor}>
                Showing:{" "}
                {filter === "solved" ? (
                  <>
                    <Text
                      as="span"
                      color={`${getDifficultyColor(filter)}.500`}
                    >
                      Solved
                    </Text>
                    <Text as="span"> Problems</Text>
                  </>
                ) : (
                  <>
                    <Text as="span" color={`${getDifficultyColor(filter)}.500`} fontWeight="medium">
                      {filter}
                    </Text>{" "}
                    Problems
                  </>
                )}
              </Text>

              <CloseButton
                size="2xs"
                onClick={() => setFilter("all")}
                variant="surface"
                _hover={{ border: "1px solid" }}
              />
            </HStack>
          </Box>
        )}



        {/* Weekday Headers */}
        <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={4}>
          {weekdays.map((day) => (
            <Box key={day} textAlign="center" p={2}>
              <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>
                {day}
              </Text>
            </Box>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid templateColumns="repeat(7, 1fr)" gap={2}>
          {renderCalendarDays()}
        </Grid>

        {/* Legend */}
        <HStack
          justify="center"
          gap={6}
          mt={6}
          fontSize="sm"
          color={"fg.muted"}
        >
          <HStack
            gap={2}
            cursor="pointer"
            onClick={() => handleLegendClick("Easy")}
            opacity={filter === "Easy" ? 1 : filter === "all" ? 1 : 0.5}
            transform={filter === "Easy" ? "scale(1.1)" : "scale(1)"}
            transition="all 0.2s"
          >
            <Box w={3} h={3} bg="green.500" borderRadius="sm" />
            <Text>Easy</Text>
          </HStack>
          <HStack
            gap={2}
            cursor="pointer"
            onClick={() => handleLegendClick("Medium")}
            opacity={filter === "Medium" ? 1 : filter === "all" ? 1 : 0.5}
            transform={filter === "Medium" ? "scale(1.1)" : "scale(1)"}
            transition="all 0.2s"
          >
            <Box w={3} h={3} bg="yellow.500" borderRadius="sm" />
            <Text>Medium</Text>
          </HStack>
          <HStack
            gap={2}
            cursor="pointer"
            onClick={() => handleLegendClick("Hard")}
            opacity={filter === "Hard" ? 1 : filter === "all" ? 1 : 0.5}
            transform={filter === "Hard" ? "scale(1.1)" : "scale(1)"}
            transition="all 0.2s"
          >
            <Box w={3} h={3} bg="red.500" borderRadius="sm" />
            <Text>Hard</Text>
          </HStack>
          <HStack
            gap={2}
            cursor="pointer"
            onClick={() => handleLegendClick("solved")}
            opacity={filter === "solved" ? 1 : filter === "all" ? 1 : 0.5}
            transform={filter === "solved" ? "scale(1.1)" : "scale(1)"}
            transition="all 0.2s"
          >
            <Box w={3} h={3} bg={todayRingColor} borderRadius="full" />
            <Text>Solved</Text>
          </HStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}