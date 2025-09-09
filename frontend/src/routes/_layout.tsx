// src/routes/_layout.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import AppLayout from '../AppLayout';
function Layout() {
  return (
    <AppLayout>
        <Outlet />
    </AppLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
  // ! add loader to specific routes that require authentication
  loader: async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (context as any).auth?.user || null;
    return {
      user
    }
  }

});
