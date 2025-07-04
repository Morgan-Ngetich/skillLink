// src/routes/_layout.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Flex, Spinner } from '@chakra-ui/react';
import AppLayout from '../AppLayout';
import { isLoggedIn } from "../hooks/auth/authState"
import { useAuth } from "../hooks/auth/useAuth"
function Layout() {
  const { isLoading } = useAuth()
  return (
    <AppLayout>
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="teal.500" />
        </Flex>
      ) : (
        <Outlet />
      )}
    </AppLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect(
        {
          to: "/login"
        }
      )
    }
  }
});
