import {
  // Box,
  Text,
  HStack,
  VStack,
  Heading,
  Table,
  Card,
  // FormatNumber,
  // Show,
} from '@chakra-ui/react';
// import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { Stat, Avatar, AvatarGroup, Tooltip, } from "@/components/ui"
import { formatDistanceToNow } from 'date-fns';
// import { InfoTip } from '@/components/ui/toggle-tip';

const ProfileViewsDashboard = () => {
  const recentViewers = [
    { id: 1, name: 'Jane Doe', location: 'Nairobi', photo: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'John Smith', location: 'Lagos', photo: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Alice Kim', location: 'Kampala', photo: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Mark Ochieng', location: 'Mombasa', photo: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Fatma Yusuf', location: 'Dar es Salaam', photo: 'https://i.pravatar.cc/150?img=5' }
  ];

  const viewerInsights = [
    { id: 1, name: 'Jane Doe', interest: 'Frontend', viewedAt: new Date(Date.now() - 3600 * 1000), photo: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'John Smith', interest: 'Backend', viewedAt: new Date(Date.now() - 7200 * 1000), photo: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Alice Kim', interest: 'Design', viewedAt: new Date(Date.now() - 86400 * 1000), photo: 'https://i.pravatar.cc/150?img=3' },
  ];

  // const conversionData = [
  //   { stage: 'Views', count: 320 },
  //   { stage: 'Clicks', count: 75 },
  //   { stage: 'Bookings', count: 28 },
  // ];

  return (
    <VStack gap={6} align="stretch">
      {/* Stat Overview */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Profile Performance</Heading>
        </Card.Header>
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

      {/* Recent Viewers */}
      <Card.Root>
        <Card.Header>
          <Heading size="sm">Recently Viewed By</Heading>
        </Card.Header>
        <Card.Body>
          <AvatarGroup size="md">
            {recentViewers.map((user) => (
              <Tooltip key={user.id} content={`${user.name}, ${user.location}`}>
                <Avatar name={user.name} src={user.photo} />
              </Tooltip>
            ))}
          </AvatarGroup>
        </Card.Body>
      </Card.Root>

      {/* Viewer Table */}
      <Card.Root>
        <Card.Header>
          <Heading size="sm">Viewer Insights</Heading>
        </Card.Header>
        <Card.Body overflowX="auto">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>User</Table.ColumnHeader>
                <Table.ColumnHeader>Interest</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {viewerInsights.map((viewer) => (
                <Table.Row key={viewer.id}>
                  <Table.Cell>
                    <HStack gap={2}>
                      <Avatar size="sm" src={viewer.photo} name={viewer.name} />
                      <Text>{viewer.name}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{viewer.interest}</Table.Cell>
                  <Table.Cell>{formatDistanceToNow(viewer.viewedAt)} ago</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>

      {/* Conversion Chart */}
      {/* <Card.Root>
        <Card.Header>
          <Heading size="sm">Conversion Funnel</Heading>
        </Card.Header>
        <Card.Body>
          <Box h="200px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData}>
                <XAxis dataKey="stage" />
                <Bar dataKey="count" fill="#3182CE" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card.Body>
      </Card.Root> */}
    </VStack>
  );
};

export default ProfileViewsDashboard;
