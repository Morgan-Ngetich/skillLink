import { Spinner } from "@chakra-ui/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from 'react';
import LoginForm from "../../pages/LoginForm";
import { isLoggedIn } from "../../hooks/auth/authState";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: () => (
    <Suspense fallback={<Spinner />}>
      <LoginForm />
    </Suspense>
  ),
  beforeLoad: async () => {
    if (await isLoggedIn()) {
      throw redirect({ to: "/" });
    }
  }
});