import { Card, HStack } from '@chakra-ui/react';
import { Stat } from '@/components/ui/stat';

export function ProfilePerformanceCard() {
  return (
    <Card.Root variant={'outline'} border={'1px solid'}>
      {/* <Card.Header>
        <Heading size="md">Profile Performance</Heading>
      </Card.Header> */}
      <Card.Body>
        <HStack gap="6" wrap="wrap">
          <Stat
            label="Profile Views"
            value={320}
            formatOptions={{ maximumFractionDigits: 0 }}
            info="Number of people who viewed your profile"
          />

          <Stat
            label="Unique Viewers"
            value={245}
            formatOptions={{ maximumFractionDigits: 0 }}
          />

          <Stat
            label="Clicks to Book"
            value={28}
            formatOptions={{ maximumFractionDigits: 0 }}
            change={0.15}
          />
          
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
