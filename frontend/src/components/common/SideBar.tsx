import {
  Box,
  Button,
  VStack,
  Icon,
  Text,
  HStack,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import {
  FiHome,
  FiSettings,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useState } from 'react';
import { Collapsible } from '@chakra-ui/react'; // use Chakra's export

const navItems = [
  { label: 'Home', icon: FiHome },
  { label: 'Profile', icon: FiUser },
  { label: 'Settings', icon: FiSettings },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} unmountOnExit>
      <Box
        as="aside"
        w={isOpen ? '220px' : '72px'}
        transition="width 0.2s ease"
        h="100vh"
        bg={{ base: 'gray.50', _dark: 'gray.900' }}
        borderRight="1px solid"
        borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
        p={4}
        position="sticky"
        top={0}
        zIndex="99"
        display={{base: "none", md: "block"}}
      >
        {/* Toggle Button */}
        <Flex justify="flex-end" mb={6}>
          <Collapsible.Trigger asChild>
            <IconButton
              aria-label="Toggle Sidebar"
              size="sm"
              variant="ghost"
              color={{ base: 'gray.700', _dark: 'gray.200' }}
              _hover={{
                bg: { base: 'gray.50', _dark: 'gray.700' },
                color: { base: 'blue.600', _dark: 'blue.300' },
              }}
            >
              {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </IconButton>
          </Collapsible.Trigger>
        </Flex>

        {/* Nav Items */}
        <VStack align="stretch" gap={2}>
          {navItems.map(({ label, icon }) => (
            <Button
              key={label}
              variant="ghost"
              justifyContent={isOpen ? 'flex-start' : 'center'}
              fontWeight="medium"
              color={{ base: 'gray.700', _dark: 'gray.200' }}
              _hover={{
                bg: { base: 'gray.100', _dark: 'gray.700' },
                color: { base: 'blue.600', _dark: 'blue.300' },
              }}
              borderRadius="md"
              px={isOpen ? 3 : 0}
              py={5}
              mb={2}
              size="sm"
            >
              <HStack
                w="full"
                gap={4}
                justifyContent={isOpen ? 'flex-start' : 'center'}
                overflow="hidden"
              >
                <Icon
                  as={icon}
                  boxSize={5}
                  color={{ base: 'gray.600', _dark: 'gray.400' }}
                />

                <Collapsible.Content
                  asChild
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={{ base: 'gray.700', _dark: 'gray.200' }}
                  >
                    {label}
                  </Text>
                </Collapsible.Content>
              </HStack>
            </Button>
          ))}
        </VStack>
      </Box>
    </Collapsible.Root>
  );
};

export default Sidebar;
