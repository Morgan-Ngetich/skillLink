// AppLayout.tsx
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './components/common/SideBar';
import Header from './components/common/Header';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Flex direction="row" w="100vw" h="100vh">
        {/* Add your Navbar / Sidebar here */}
        <Header />
        <Sidebar />
        <Box>
          {children}
        </Box>
      </Flex>
    </>
  );
};

export default AppLayout;
