import { useRef } from "react";
import {
  Box,
  Badge,
  Text,
  VStack,
  HStack,
  Link,
} from '@chakra-ui/react';
import { useColorModeValue, Progress, Tooltip, Avatar } from '@/components/ui';
import { formatDistanceStrict } from "date-fns";

export function URLPreview({ url }: { url: string }) {
  const domain = new URL(url).hostname.replace('www.', '');
  return (
    <Link
      href={url}
      fontSize="sm"
      color="blue.500"
      textDecoration="underline"
      lineClamp={1}
    >
      {domain} ↗
    </Link>
  );
}

export function ProjectCard({
  title,
  category,
  task,
  progress,
  deadline,
  url,
  todayFocus,
  mentors = []
}: any) {
  const bg = useColorModeValue('gray.50', 'gray.800');
  const highlight = todayFocus
    ? {
      border: '2px solid',
      borderColor: 'green.400',
      boxShadow: 'md',
    }
    : {};
  const avatarsContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      p={4}
      borderRadius="xl"
      bg={"cardbg"}
      borderWidth="2px"
      {...highlight}
      transition="all 0.2s ease"
    >
      <VStack align="start" gap={2}>
        <HStack justify="space-between" w="full">
          <Text fontWeight="semibold" fontSize={'sm'} lineClamp={1}>{title}</Text>
          <Badge size={'xs'} border="1px solid" colorPalette={'orange'}>{category}</Badge>
        </HStack>
        <Text fontSize="xs" color={'fg.muted'}>
          Task: {task}
        </Text>

        <Progress value={progress} size="xs" borderRadius="full" w="full" />

        <Text fontSize="xs">
          {progress}% complete • {formatDistanceStrict(new Date(), deadline)} left
        </Text>

        <URLPreview url={url} />
      </VStack>

      {mentors.length > 0 && (
        <Box position="relative" w={`${40 + (mentors.length - 1) * 20}px`} h="34px" mt={2} ref={avatarsContainerRef}>
          {mentors.map((mentor, index: number) => (
            <Tooltip key={mentor.name} content={mentor.name} showArrow>
              <Box
                position="absolute"
                top="0"
                left={`${index * 20}px`}
                zIndex={mentors.length - index}
                cursor="pointer"
                p={1}
                borderRadius="full"
                display="inline-block"
                _hover={{ zIndex: 999 }}
              >
                <Avatar
                  size="sm"
                  name={mentor.name}
                  src={mentor.avatar}
                  border="1px solid"
                />
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
}
