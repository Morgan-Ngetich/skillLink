import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './components/common/SideBar';
import Header from './components/common/Header';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Flex w="100vw" h="100vh" overflow="hidden">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />

      {/* Right side holds Header and Content */}
      <Flex direction="column" flex="1" overflow="hidden">
        <Header />
        <Box as="main" flex="1" p={4} overflowY="auto" bg="gray.50">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppLayout;
