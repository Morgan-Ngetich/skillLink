import {
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { FaNoteSticky, FaVideo } from 'react-icons/fa6';

export default function MenteeDashboardHeader() {

  return (
    <Card.Root>
      <CardBody p={6}>
        <VStack align="start" gap={4}>
          <HStack>
            <Text fontSize={"4xl"}>
              👋
            </Text>

            <Heading fontSize={"4xl"}>
              Good morning, Alex!
            </Heading>
          </HStack>

          <Text fontSize="md" color={"fg.muted"}>
            Your next session with <Text as="span" fontWeight="semibold" color="orange">John</Text> is in <Text as="span" fontWeight="bold" color="green.500">2 days</Text>.
          </Text>

          <HStack gap={3}>
            <Button colorScheme="blue"> <FaVideo/> Join Session</Button>
            <Button variant="outline" colorScheme="blue"> <FaNoteSticky/> Prepare Notes</Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}