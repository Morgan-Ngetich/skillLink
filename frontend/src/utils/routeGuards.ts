import { redirect } from "@tanstack/react-router";
import { fetchCurrentUser } from "@/hooks/auth/useAuthQuery";
import type { RouteMatch } from "@tanstack/react-router";

// RouteMatch needs 7 type arguments, but we don't care about them here.
// So, we use 'unknown' for all to keep it simple.
type AnyRouteMatch = RouteMatch<unknown, unknown, unknown, unknown, unknown, unknown, unknown>;

// export function isProtectedRoute(matches: AnyRouteMatch[]): boolean {
//   return matches.some(match => match.route?.meta?.requiresAuth === true);
// }

export function isProtectedRoute(matches: AnyRouteMatch[]): boolean {
  // @ts-expect-error: TS may complain if 'route' isn't officially in type
  return matches.some(match => match.loaderData?.requiresAuth === true);
}


// Accepts search as an object and do the serialization inside
export async function requireProfileCompletion(location: { pathname: string; search: Record<string, string> }) {
  const user = await fetchCurrentUser();
  if (!user?.profile?.is_profile_setup_complete) {
    throw redirect({
      to: "/profile-setup",
      // Serialize the search object back to a query string from <{ foo: "bar", page: "2" } >  to  <"?foo=bar&page=2">
      search: {
        redirectTo: location.pathname + '?' + new URLSearchParams(location.search).toString(),
      },
    });
  }
}
