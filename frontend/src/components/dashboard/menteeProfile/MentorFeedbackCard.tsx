'use client'

import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'
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
      name: 'David Owino',
      photo: 'https://i.pravatar.cc/150?img=2',
    },
    feedback:
      'Try to focus your next session on debugging strategies — it’ll help with your backend confidence.',
    createdAt: '5 days ago',
    sentiment: 'neutral',
  },
]

export const MentorFeedbackCard = () => {
  return (
    <Card.Root variant={'outline'} border="1px solid" maxH='xs' bg={{ _dark: 'transparent' }}>
      <Card.Header>
        <Heading size="sm">Mentor Feedback</Heading>
      </Card.Header>
      <Card.Body as={VStack} gap={4} align="stretch" overflowY={'auto'}>
        {feedbackData.map(({ id, mentor, feedback, createdAt, sentiment }, index) => (
          <Box key={id}>
            <HStack align="start" gap={3}>
              <Avatar size="sm" name={mentor.name} src={mentor.photo} />
              <Box>
                {/* Line with name · date · sentiment */}
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

            {index !== feedbackData.length - 1 && <Separator mt={4} />}
          </Box>
        ))}
      </Card.Body>
    </Card.Root>
  )
}
