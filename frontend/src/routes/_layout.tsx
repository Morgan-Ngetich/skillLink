// src/routes/_layout.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import AppLayout from '../AppLayout';
import { isLoggedIn } from "../hooks/auth/authState"
function Layout() {
  return (
    <AppLayout>
        <Outlet />
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
