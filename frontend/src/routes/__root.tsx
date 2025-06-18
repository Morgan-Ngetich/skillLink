// _root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import NotFound from '../components/common/NotFound';

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

function RootComponent() {
  return (
    <>
      <Outlet />
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
});
