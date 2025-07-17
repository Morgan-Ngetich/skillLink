import { Box, Flex } from '@chakra-ui/react';
import { useAuthPromptStore } from '@/hooks/store/useAuthPromptStore';
import Sidebar from '@/components/common/SideBar';
import Header from '@/components/common/Header';
import AuthPromptDialog from '@/components/common/AuthPromptDialog';
import { useAuthPromptController } from './hooks/store/useAuthPromptController';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthPromptController();
  const { open, mode, setOpen } = useAuthPromptStore();

  return (
    <Flex w="100vw" h="100vh" overflow="hidden" >
      <Sidebar />

      <Flex direction="column" flex="1" overflow="hidden">
        <Header />
        <Box as="main" flex="1" overflowY="auto">
          {children}
        </Box>
      </Flex>

      {open && (
        <AuthPromptDialog
          open={open}
          showStayLoggedOut={mode === 'full'}
          onClose={() => setOpen(false)}
        />
      )}

    </Flex>
  );
};

export default AppLayout;
