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
});
