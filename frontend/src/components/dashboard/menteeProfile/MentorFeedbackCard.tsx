import { useEffect, useRef, useState, useMemo } from 'react'
import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  VStack,
  Flex,
  Separator,
  Text,
  Button,
  Input,
  Select,
  Grid,
  GridItem,
  InputGroup,
  InputElement,
  Icon,
  Spacer,
} from '@chakra-ui/react'
import {
  LuMessageCircle,
  LuTrendingUp,
  LuClock,
  LuChevronRight,
  LuSearch,
  LuStar,
  LuCalendar
} from 'react-icons/lu'
import { Avatar } from "@/components/ui"
import {
  SelectTrigger,
  SelectRoot,
  SelectItem,
  SelectContent,
  SelectValueText

} from "@/components/ui"
import { createListCollection } from "@chakra-ui/react"

// Define options for both dropdowns
const sentimentOptions = createListCollection({
  items: [
    { label: "All Sentiments", value: "all" },
    { label: "Positive", value: "positive" },
    { label: "Suggestions", value: "neutral" },
  ],
})

const sortOptions = createListCollection({
  items: [
    { label: "Most Recent", value: "recent" },
    { label: "By Priority", value: "priority" },
    { label: "By Rating", value: "rating" },
  ],
})

const feedbackData = [
  {
    id: 1,
    mentor: {
      name: 'Jane Kimani',
      photo: 'https://i.pravatar.cc/150?img=1',
      role: 'Senior UX Designer',
      rating: 4.9
    },
    feedback:
      'You\'ve made excellent progress on your portfolio! Consider refining your case studies to highlight decision-making processes and user impact metrics.',
    createdAt: '2 days ago',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    category: 'Portfolio',
    priority: 'high',
    tags: ['UX', 'Portfolio', 'Case Studies']
  },
  {
    id: 2,
    mentor: {
      name: 'David Owino',
      photo: 'https://i.pravatar.cc/150?img=2',
      role: 'Backend Engineer',
      rating: 4.7
    },
    feedback:
      'Try to focus your next session on debugging strategies — it\'ll help with your backend confidence. Consider learning about logging best practices.',
    createdAt: '5 days ago',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    sentiment: 'neutral',
    category: 'Technical Skills',
    priority: 'medium',
    tags: ['Backend', 'Debugging', 'Best Practices']
  },
  {
    id: 3,
    mentor: {
      name: 'Lara Patel',
      photo: 'https://i.pravatar.cc/150?img=3',
      role: 'Product Manager',
      rating: 4.8
    },
    feedback:
      'Nice work on your presentation! You can add more impact by focusing on problem framing and stakeholder alignment.',
    createdAt: '1 week ago',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    category: 'Presentation',
    priority: 'medium',
    tags: ['Presentation', 'Product Management']
  },
  {
    id: 4,
    mentor: {
      name: 'Tom Muthoni',
      photo: 'https://i.pravatar.cc/150?img=4',
      role: 'Full Stack Developer',
      rating: 4.6
    },
    feedback:
      'Keep pushing — even small improvements in code readability go a long way. Consider implementing code review practices.',
    createdAt: '1 week ago',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    sentiment: 'neutral',
    category: 'Code Quality',
    priority: 'low',
    tags: ['Code Quality', 'Best Practices']
  },
  {
    id: 5,
    mentor: {
      name: 'Asha Njeri',
      photo: 'https://i.pravatar.cc/150?img=5',
      role: 'Team Lead',
      rating: 4.9
    },
    feedback:
      'Would love to see more collaboration in your next sprint! Try pair programming or leading a team discussion.',
    createdAt: '2 weeks ago',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    category: 'Collaboration',
    priority: 'high',
    tags: ['Collaboration', 'Leadership']
  },
  {
    id: 6,
    mentor: {
      name: 'Michael Chen',
      photo: 'https://i.pravatar.cc/150?img=6',
      role: 'DevOps Engineer',
      rating: 4.5
    },
    feedback:
      'Your CI/CD pipeline setup was impressive. Next, focus on monitoring and alerting to complete the DevOps cycle.',
    createdAt: '2 weeks ago',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    category: 'DevOps',
    priority: 'medium',
    tags: ['DevOps', 'CI/CD', 'Monitoring']
  },
  {
    id: 7,
    mentor: {
      name: 'Sarah Williams',
      photo: 'https://i.pravatar.cc/150?img=7',
      role: 'Data Scientist',
      rating: 4.8
    },
    feedback:
      'Your data analysis approach is solid. Consider exploring machine learning applications for your current project.',
    createdAt: '3 weeks ago',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    category: 'Data Science',
    priority: 'low',
    tags: ['Data Science', 'Machine Learning']
  }
]

export const MentorFeedbackCard = () => {
  const [showSeeMore, setShowSeeMore] = useState(false)
  const [maxVisible, setMaxVisible] = useState(4)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSentiment, setFilterSentiment] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const scrollRef = useRef(null)

  // Filter and sort feedback
  const filteredFeedback = useMemo(() => {
    let filtered = feedbackData

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sentiment filter
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment === filterSentiment)
    }

    // Sort
    if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => b.timestamp - a.timestamp)
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      filtered = filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    } else if (sortBy === 'rating') {
      filtered = filtered.sort((a, b) => b.mentor.rating - a.mentor.rating)
    }

    return filtered
  }, [searchTerm, filterSentiment, sortBy])

  // Stats calculation
  const stats = useMemo(() => {
    const total = feedbackData.length
    const positive = feedbackData.filter(f => f.sentiment === 'positive').length
    const recent = feedbackData.filter(f => f.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
    const avgRating = feedbackData.reduce((acc, f) => acc + f.mentor.rating, 0) / total

    return { total, positive, recent, avgRating: avgRating.toFixed(1) }
  }, [])

  // Detect scroll-to-end
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10
      if (isAtBottom && filteredFeedback.length > maxVisible) {
        setShowSeeMore(true)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [maxVisible, filteredFeedback.length])

  const handleSeeMore = () => {
    setMaxVisible(prev => prev + 4)
    setShowSeeMore(false)
  }

  const getSentimentColorPalette = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'green'
      case 'neutral': return 'yellow'
      default: return 'gray'
    }
  }

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'high': return 'red.500'
      case 'medium': return 'yellow.500'
      case 'low': return 'green.500'
      default: return 'gray.300'
    }
  }

  return (
    <Card.Root
      variant="outline"
      maxH="lg"
      position="relative"
      overflow="hidden"
    >
      {/* Header */}
      <Card.Header p={3}>
        <Flex align="center" justify="space-between">
          <HStack gap={3}>
            <Icon color="blue.500" boxSize={6}>
              <LuMessageCircle />
            </Icon>
            <Heading size="lg">Mentor Feedback</Heading>
          </HStack>
          {/* <Text fontSize="sm" color="fg.muted">
            {filteredFeedback.length} of {stats.total} items
          </Text> */}
        </Flex>

        {/* Quick Stats
        <Grid templateColumns="repeat(4, 1fr)" gap={3} mb={4}>
          <Card.Root bg="blue.50" variant="subtle">
            <Card.Body textAlign="center" py={3}>
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                {stats.total}
              </Text>
              <Text fontSize="xs" color="fg.muted">Total</Text>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="green.50" variant="subtle">
            <Card.Body textAlign="center" py={3}>
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                {stats.positive}
              </Text>
              <Text fontSize="xs" color="fg.muted">Positive</Text>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="orange.50" variant="subtle">
            <Card.Body textAlign="center" py={3}>
              <Text fontSize="xl" fontWeight="bold" color="orange.600">
                {stats.recent}
              </Text>
              <Text fontSize="xs" color="fg.muted">This Week</Text>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="purple.50" variant="subtle">
            <Card.Body textAlign="center" py={3}>
              <HStack justify="center" gap={1}>
                <Icon color="yellow.500" boxSize={4}>
                  <LuStar />
                </Icon>
                <Text fontSize="xl" fontWeight="bold" color="purple.600">
                  {stats.avgRating}
                </Text>
              </HStack>
            </Card.Body>
          </Card.Root>
        </Grid> */}

        {/* Controls */}
        {/* <Flex gap={2} wrap="wrap">
          <Box flex="1" minW="200px">
            <InputGroup startElement={
              <Icon color="fg.muted" boxSize={4}>
                <LuSearch />
              </Icon>
            }>
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
              />
            </InputGroup>
          </Box>

          <SelectRoot
            value={[filterSentiment]}
            onValueChange={(e) => setFilterSentiment(e.value[0])}
            size="sm"
            collection={sentimentOptions}
          >
            <SelectTrigger>
              <SelectValueText placeholder="All Sentiments" />
            </SelectTrigger>
            <SelectContent>
              {sentimentOptions.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>

          <SelectRoot
            value={[sortBy]}
            onValueChange={(e) => setSortBy(e.value[0])}
            size="sm"
            collection={sortOptions}
          >
            <SelectTrigger>
              <SelectValueText placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>

        </Flex> */}
      </Card.Header>

      {/* Feedback List */}
      <Card.Body
        // ref={scrollRef}
        overflowY="auto"
        // maxH="400px"
        px={4}
        pt={0}
      >
        <VStack gap={2} align="stretch">
          {filteredFeedback.slice(0, maxVisible).map((item, index) => (
            <Card.Root
              key={item.id}
              variant="outline"
              borderLeftWidth="2px"
              borderLeftColor={getPriorityBorderColor(item.priority)}
              _hover={{ shadow: 'md' }}
              transition="all 0.2s"
            >
              <Card.Body p={2} bg={{base: "gray.100", _dark: "gray.900"}} _hover={{cursor: "pointer"}}>
                <HStack align="start" gap={3}>
                  <Avatar
                    size="sm"
                    name={item.mentor.name}
                    src={item.mentor.photo}
                  />
                  <Box flex="1">
                    <HStack gap={2} mb={2} wrap="wrap">
                      <Text fontWeight="medium">{item.mentor.name}</Text>
                      <Text fontSize="xs" color="fg.muted">•</Text>
                      <Text fontSize="xs" color="fg.muted">{item.mentor.role}</Text>
                      <Text fontSize="xs" color="fg.muted">•</Text>
                      <HStack gap={1}>
                        <Icon color="yellow.500" boxSize={3}>
                          <LuStar />
                        </Icon>
                        <Text fontSize="xs" color="fg.muted">{item.mentor.rating}</Text>
                      </HStack>
                    </HStack>

                    <Text fontSize="sm" mb={2} lineHeight="relaxed">
                      {item.feedback}
                    </Text>

                    <Flex justify="space-" align="center">
                      <HStack gap={2} wrap="wrap">
                        <HStack gap={1}>
                          <Icon boxSize={3} color="fg.muted">
                            <LuClock />
                          </Icon>
                          <Text fontSize="xs" color="fg.muted">
                            {item.createdAt}
                          </Text>
                        </HStack>

                        <Badge
                          size="sm"
                          colorPalette={getSentimentColorPalette(item.sentiment)}
                          variant="surface"
                        >
                          {item.sentiment === 'positive' ? 'Positive' : 'Suggestion'}
                        </Badge>

                        <Badge size="sm" variant="surface" border="1px solid gray">
                          {item.category}
                        </Badge>
                      </HStack>

                      {/* <HStack gap={1}>
                        {item.tags.slice(0, 2).map(tag => (
                          <Badge
                            key={tag}
                            size="sm"
                            variant="surface"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </HStack> */}
                    </Flex>
                  </Box>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}

          {filteredFeedback.length === 0 && (
            <VStack py={8} color="fg.muted">
              <Icon boxSize={12} color="gray.300">
                <LuMessageCircle />
              </Icon>
              <Text>No feedback matches your search criteria</Text>
            </VStack>
          )}
        </VStack>
      </Card.Body>

      {/* See More Button */}
      {/* {showSeeMore && filteredFeedback.length > maxVisible && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="linear(to-t, white, white/0)"
          p={4}
          display="flex"
          justifyContent="center"
        >
          <Button
            onClick={handleSeeMore}
            colorPalette="blue"
            size="sm"
          >
            <LuChevronRight />Load More Feedback
          </Button>
        </Box>
      )} */}

      {/* View All Button */}
      {/* {maxVisible >= filteredFeedback.length && filteredFeedback.length > 4 && (
        <Card.Footer bg="gray.50" borderTop="1px solid" borderColor="border">
          <Button
            variant="ghost"
            colorPalette="blue"
            size="sm"
            width="full"
            onClick={() => console.log("Navigate to full feedback page")}
          >
            <LuTrendingUp /> View Detailed Analytics <LuChevronRight />
          </Button>
        </Card.Footer>
      )} */}
    </Card.Root>
  )
}