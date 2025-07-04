import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '@/components/common/SideBar';
import Header from '@/components/common/Header';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Flex w="100vw" h="100vh" overflow="hidden" bg={{ base: 'gray.50', _dark: 'gray.900' }}>
      <Sidebar />

      <Flex direction="column" flex="1" overflow="hidden">
        <Header />
        <Box as="main" flex="1"  overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppLayout;
