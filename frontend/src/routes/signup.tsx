import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from 'react';
import SignupForm from "../pages/SignupForm";
// import { isLoggedIn } from "../hooks/auth/authState";

export const Route = createFileRoute("/signup")({
  component: () => (
    <Suspense fallback={<Spinner />}>
      <SignupForm />
    </Suspense>

  ),
});