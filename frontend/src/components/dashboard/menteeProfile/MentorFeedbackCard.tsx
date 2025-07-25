'use client'

import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  Flex,
  Separator,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
// import { useRouter } from '@tanstack/react-router'
import { Avatar } from "@/components/ui"

const feedbackData = [
  {
    id: 1,
    mentor: {
      name: 'Jane Kimani',
      photo: 'https://i.pravatar.cc/150?img=1',
    },
    feedback:
      'You’ve made excellent progress on your portfolio! Consider refining your case studies to highlight decision-making.',
    createdAt: '2 days ago',
    sentiment: 'positive',
  },
  {
    id: 2,
    mentor: {
      name: 'David Owino',
      photo: 'https://i.pravatar.cc/150?img=2',
    },
    feedback:
      'Try to focus your next session on debugging strategies — it’ll help with your backend confidence.',
    createdAt: '5 days ago',
    sentiment: 'neutral',
  },
  {
    id: 3,
    mentor: {
      name: 'Lara Patel',
      photo: 'https://i.pravatar.cc/150?img=3',
    },
    feedback:
      'Nice work on your presentation! You can add more impact by focusing on problem framing.',
    createdAt: '1 week ago',
    sentiment: 'positive',
  },
  {
    id: 4,
    mentor: {
      name: 'Tom Muthoni',
      photo: 'https://i.pravatar.cc/150?img=4',
    },
    feedback:
      'Keep pushing — even small improvements in code readability go a long way.',
    createdAt: '1 week ago',
    sentiment: 'neutral',
  },
  {
    id: 5,
    mentor: {
      name: 'Asha Njeri',
      photo: 'https://i.pravatar.cc/150?img=5',
    },
    feedback:
      'Would love to see more collaboration in your next sprint!',
    createdAt: '2 weeks ago',
    sentiment: 'positive',
  },
]

export const MentorFeedbackCard = () => {
  const [showSeeMore, setShowSeeMore] = useState(false)
  const [maxVisible] = useState(4)
  const scrollRef = useRef<HTMLDivElement>(null)
  // const router = useRouter()

  // Detect scroll-to-end
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10
      if (isAtBottom) {
        setShowSeeMore(true)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSeeMore = () => {
    console.log("'/dashboard/feedback'")
  }

  return (
    <Card.Root
      variant="outline"
      border="1px solid"
      bg={{ _dark: 'transparent' }}
      maxH="xs"
      position="relative"
    >
      <Card.Header>
        <Heading size="sm">Mentor Feedback</Heading>
      </Card.Header>

      <Card.Body
        as={VStack}
        gap={4}
        overflowY="auto"
        ref={scrollRef}
        maxH="250px"
        pr={2}
      >
        {feedbackData.slice(0, maxVisible).map(({ id, mentor, feedback, createdAt, sentiment }, index) => (
          <Box key={id}>
            <HStack align="start" gap={3}>
              <Avatar size="sm" name={mentor.name} src={mentor.photo} />
              <Box>
                <HStack gap={2} mb={1} wrap="wrap">
                  <Text fontWeight="medium">{mentor.name}</Text>
                  <Text fontSize="xs" color="fg.muted">·</Text>
                  <Text fontSize="xs" color="fg.muted">{createdAt}</Text>
                  {sentiment && (
                    <>
                      <Text fontSize="xs" color="fg.muted">·</Text>
                      <Badge
                        size="xs"
                        colorPalette={sentiment === 'positive' ? 'green' : 'yellow'}
                        variant="subtle"
                      >
                        {sentiment === 'positive' ? 'Positive' : 'Suggestion'}
                      </Badge>
                    </>
                  )}
                </HStack>
                <Text fontSize="sm">{feedback}</Text>
              </Box>
            </HStack>
            {index !== maxVisible - 1 && <Separator mt={4} />}
          </Box>
        ))}
      </Card.Body>

      {showSeeMore && (
        <Flex
          justify="flex-end"
          align="center"
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          py={2}
          pr={4}
 
          bg="linear(to-t, white, red)"
          zIndex="docked"
        >
          <Button size="sm" onClick={handleSeeMore}>
            See all feedback
          </Button>
        </Flex>
      )}

    </Card.Root>
  )
}
