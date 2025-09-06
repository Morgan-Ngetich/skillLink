import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Collapsible,
  HStack,
  Icon,
  Stack,
  Text,
  Timeline,
  Badge,
  Link,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { Avatar, Tooltip, useColorModeValue } from '@/components/ui';
import {
  LuCalendarClock,
  LuCheck,
  LuExternalLink,
  LuFileText,
  LuVideo
} from 'react-icons/lu';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useState } from 'react';
import { FaBell, FaBellSlash, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import useToaster from '@/hooks/useToaster';
import GoalsAndInterestsTabs from '../menteeProfile/menteeProfileCard/GoalAndInterestSection';

type SessionStatus = 'completed' | 'upcoming' | 'missed' | 'in-progress';

interface Session {
  id: string;
  time: string;
  date: Date;
  title: string;
  duration: string;
  agenda: string[];
  goal: string;
  user: {
    name: string;
    avatar: string;
    bio: string;
    track: string;
  };
  status: SessionStatus;
  resources?: {
    title: string;
    url: string;
    type: 'document' | 'video' | 'link';
  }[];
  meetingLink?: string;
}

const sessions: Session[] = [
  {
    id: '1',
    time: '09:00 AM',
    date: new Date(2023, 10, 15),
    title: 'Morning Check-In',
    duration: '30 mins',
    agenda: ['Share daily goals', 'Review blockers', 'Quick updates'],
    goal: 'Establish daily accountability habits',
    user: {
      name: 'Jenna Smith',
      avatar: 'https://i.pravatar.cc/150?u=js',
      bio: 'Frontend developer',
      track: 'Career track'
    },
    status: 'completed',
    resources: [
      {
        title: 'Goal Setting Template',
        url: '#',
        type: 'document'
      },
      {
        title: 'Previous Session Notes',
        url: '#',
        type: 'document'
      }
    ]
  },
  {
    id: '2',
    time: '12:30 PM',
    date: new Date(2023, 10, 15),
    title: 'Goal Planning Session',
    duration: '45 mins',
    agenda: ['Review Figma wireframes', 'Define success criteria', 'Assign tasks'],
    goal: 'Build 3 case studies and apply to 10 roles',
    user: {
      name: 'Lucas Mora',
      avatar: 'https://i.pravatar.cc/150?u=lm',
      bio: 'Aspiring Product Designer',
      track: 'UX Track'
    },
    status: 'in-progress',
    meetingLink: 'https://meet.google.com/abc-xyz-123',
    resources: [
      {
        title: 'Figma Wireframes',
        url: '#',
        type: 'link'
      },
      {
        title: 'Design System Guide',
        url: '#',
        type: 'document'
      }
    ]
  },
  {
    id: '3',
    time: '03:00 PM',
    date: new Date(2023, 10, 15),
    title: 'Progress Review',
    duration: '30 mins',
    agenda: ['Discuss weekly progress', 'Share feedback', 'Plan next actions'],
    goal: 'Keep mentee on track toward internship',
    user: {
      name: 'Erica Fields',
      avatar: 'https://i.pravatar.cc/150?u=ef',
      bio: 'Data Analyst',
      track: 'Growth Track'
    },
    status: 'upcoming',
    resources: [
      {
        title: 'Data Analysis Tutorial',
        url: '#',
        type: 'video'
      }
    ]
  },
  {
    id: '4',
    time: '10:00 AM',
    date: new Date(2023, 10, 8),
    title: 'Technical Interview Prep',
    duration: '60 mins',
    agenda: ['Whiteboarding practice', 'System design concepts', 'Q&A'],
    goal: 'Prepare for upcoming FAANG interviews',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?u=aj',
      bio: 'Software Engineer',
      track: 'Interview Prep'
    },
    status: 'missed',
    resources: [
      {
        title: 'Interview Cheatsheet',
        url: '#',
        type: 'document'
      }
    ]
  }
];

const MentorshipTimeline = () => {
  const borderColor = { base: 'gray.200', _dark: 'gray.600' };
  const toast = useToaster();

  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setReminders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    toast({
      id: "reminder",
      title: reminders[id] ? 'Reminder removed' : 'Reminder set',
      description: reminders[id]
        ? `You won't be notified about this session`
        : `You'll be notified 15 minutes before the session`,
      status: 'success',
    });
  };

  const handleJoinSession = (session: Session) => {
    if (!session.meetingLink) {
      toast({
        id: "join-session",
        title: 'No meeting link available',
        description: 'The mentor has not provided a meeting link for this session',
        status: 'warning',
      });
      return;
    }
    window.open(session.meetingLink, '_blank');
  };

  const toggleExpandSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const MotionIcon = motion.div;

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return '';
      case 'upcoming':
        return 'blue.500';
      case 'in-progress':
        return 'green.500';
      case 'missed':
        return 'red.500';
      default:
        return 'gray.400';
    }
  };

  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return <LuCheck />;
      case 'in-progress':
        return <FaClock />;
      case 'missed':
        return <FaCalendarAlt />;
      default:
        return <LuCalendarClock />;
    }
  };

  const getResourceIcon = (type: 'document' | 'video' | 'link') => {
    switch (type) {
      case 'document':
        return <LuFileText />;
      case 'video':
        return <LuVideo />;
      case 'link':
        return <LuExternalLink />;
      default:
        return <LuExternalLink />;
    }
  };


  const iconBell = useColorModeValue("gray.200", "gray.600")
  
  return (
    <Box border={'1px solid'} borderRadius={'lg'} w='full'>
      <Box px={8} pt={4} position="sticky" top={0} zIndex={1}>
        <Text fontWeight="semibold" fontSize="lg" mb={2}>
          Upcoming Session
        </Text>
      </Box>

      <Box maxH={'xl'} overflowY={'auto'} px={8} py={4} >

        <Timeline.Root size="lg" variant="solid">
          {sessions.map((session) => (
            <Timeline.Item key={session.id}>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator bg={getStatusColor(session.status)}>
                  <Icon>
                    {getStatusIcon(session.status)}
                  </Icon>
                </Timeline.Indicator>
              </Timeline.Connector>

              <Timeline.Content>
                <Timeline.Title>
                  {session.time}
                </Timeline.Title>
                <Collapsible.Root
                  open={expandedSession === session.id}
                  onOpenChange={() => toggleExpandSession(session.id)}
                >
                  <Card.Root
                    size="sm"
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={borderColor}
                    shadow="md"
                    _hover={{
                      shadow: 'lg',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease'
                    }}
                    maxW={'2xl'}
                  >
                    <Card.Body>
                      <HStack gap="4" align="center">
                        <Box position={'relative'}>
                          <Avatar
                            size="sm"
                            name={session.user.name}
                            src={session.user.avatar}
                          />
                          {/* 
                        <Badge
                          colorPalette={
                            session.status === 'completed' ? 'green' :
                              session.status === 'missed' ? 'red' :
                                session.status === 'in-progress' ? 'yellow' : 'blue'
                          }
                          borderRadius="full"
                          // boxSize="6px"
                          position="absolute"
                          top="-3"
                          right="-2"
                          border="1px solid"
                        >+ </Badge> */}
                        </Box>

                        <Stack gap={0} flex="1">
                          <HStack>
                            <Text fontWeight="semibold" fontSize="md">
                              {session.title}
                            </Text>
                            <Badge
                              colorPalette={
                                session.status === 'completed' ? 'black' :
                                  session.status === 'missed' ? 'red' :
                                    session.status === 'in-progress' ? 'green' : 'blue'
                              }
                              fontSize="xs"
                              variant={'subtle'}
                              border="1px solid"
                            >
                              {session.status.replace('-', ' ')}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="fg.muted">
                            {session.user.name} • {format(session.date, 'MMM d, yyyy')} • {session.time} • {session.duration}
                          </Text>
                        </Stack>
                        <ButtonGroup size="sm" gap="3">
                          <Tooltip
                            content={session.status === 'missed' ? 'This session was missed' : ''}
                            disabled={session.status !== 'missed'}
                          >

                            <Button
                              onClick={() => handleJoinSession(session)}
                              disabled={session.status === 'missed'}
                              colorPalette={
                                session.status === 'in-progress' ? 'green' :
                                  session.status === 'upcoming' ? 'blue' : 'gray'
                              }
                            >
                              {session.status === 'in-progress' ? <FaClock /> : undefined}

                              {session.status === 'completed' ? 'Completed' :
                                session.status === 'missed' ? 'Missed' :
                                  session.status === 'in-progress' ? 'Join Now' : 'Join'}
                            </Button>

                          </Tooltip>

                          <Button
                            variant="surface"
                            px={2}
                            onClick={() => handleToggle(session.id)}
                            aria-label="Toggle Reminder"
                            disabled={session.status === 'completed' || session.status === 'missed'}
                          >
                            <HStack gap={2}>
                              <AnimatePresence mode="wait" initial={false}>
                                {reminders[session.id] ? (
                                  <MotionIcon
                                    key="on"
                                    initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                                    animate={{
                                      scale: [1, 1.1, 1],
                                      rotate: [0, -15, 15, -10, 10, 0],
                                      opacity: 1,
                                    }}
                                    exit={{ scale: 0.6, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                  >
                                    <FaBell />
                                  </MotionIcon>
                                ) : (
                                  <MotionIcon
                                    key="off"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.6, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <FaBellSlash color={iconBell} />
                                  </MotionIcon>
                                )}
                              </AnimatePresence>
                            </HStack>
                          </Button>
                        </ButtonGroup>
                      </HStack>
                    </Card.Body>

                    <Card.Footer justifyContent="flex-end" gap={2}>
                      <Collapsible.Trigger asChild>
                        <HStack>
                          {/* <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                        >
                          {expandedSession === session.id ? 'Hide details' : 'View details'}
                        </Button> */}
                          <motion.span
                            animate={{
                              rotate: expandedSession === session.id ? 180 : 0
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {expandedSession ? <FiMinimize2 /> : <FiMaximize2 />}
                          </motion.span>
                        </HStack>
                      </Collapsible.Trigger>
                    </Card.Footer>
                    <Collapsible.Content>
                      <Box px={4} pb={4} pt={1}>
                        <VStack gap={4} align="stretch">
                          <Box>
                            <Text fontWeight="semibold">🎯 Goal</Text>
                            <GoalsAndInterestsTabs />
                          </Box>

                          {/* Agenda */}
                          <Box>
                            <Text fontWeight="semibold">Agenda</Text>
                            <Stack gap={1} fontSize="sm" mt={1}>
                              {session.agenda.map((item, idx) => (
                                <HStack key={idx} align="flex-start">
                                  <Text>•</Text>
                                  <Text>{item}</Text>
                                </HStack>
                              ))}
                            </Stack>
                          </Box>

                          {/* Resources */}
                          <Box>
                            <Text fontWeight="semibold">📎 Resources</Text>
                            {session.resources && session.resources.length > 0 ? (
                              <VStack align="stretch" gap={2} mt={2}>
                                {session.resources.map((resource, idx) => (
                                  <HStack
                                    key={idx}
                                    as={Link}
                                    // href={resource.url} 
                                    // target="_blank"
                                    p={2}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{
                                      textDecoration: 'none'
                                    }}
                                  >

                                    <IconButton>
                                      {getResourceIcon(resource.type)}
                                    </IconButton>
                                    <Text fontSize="sm">{resource.title}</Text>
                                  </HStack>
                                ))}
                              </VStack>
                            ) : (
                              <Text fontSize="sm" color="fg.muted" mt={1}>No resources shared yet</Text>
                            )}
                          </Box>

                          {session.meetingLink && (
                            <Box>
                              <Button
                                size="sm"
                                onClick={() => handleJoinSession(session)}
                              >
                                Meeting Link
                              </Button>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    </Collapsible.Content>
                  </Card.Root>
                </Collapsible.Root>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline.Root>
      </Box>
    </Box>
  );
};

export default MentorshipTimeline;