// src/routes/_layout.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Flex, Spinner } from '@chakra-ui/react';
import AppLayout from '../AppLayout';

function Layout() {
  const isLoading = false; // TODO: Replace with real loading state

  return (
    <AppLayout>
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Outlet />
      )}
    </AppLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
});
