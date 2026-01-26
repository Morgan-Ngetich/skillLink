import { createFileRoute } from "@tanstack/react-router";
import { lazy } from 'react';
import { PublicService } from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import HomePageSkeleton from "@/skeletons/homePage/Index";

// Lazy load the homepage component
const HomePage = lazy(() => import("@/pages/HomePage"));

// Define the fetch function here or import it
async function fetchFeaturedData() {
  try {
    const [mentors, sessions, services] = await Promise.all([
      toNativePromise(PublicService.getFeaturedMentorsApiV1PublicFeaturedMentorsGet()),
      toNativePromise(PublicService.getFeaturedSessionsApiV1PublicFeaturedSessionsGet()),
      toNativePromise(PublicService.getFeaturedServicesApiV1PublicFeaturedServicesGet())
    ]);
    
    return { mentors, sessions, services };
  } catch (error) {
    console.error('Failed to load featured data:', error);
    return { mentors: [], sessions: [], services: [] };
  }
}

export const Route = createFileRoute("/_layout/")({
  loader: async () => {
    // Await the data in the loader
    const featuredData = await fetchFeaturedData();
    
    return {
      // Return the RESOLVED data, not a promise
      featuredData,
    };
  },
  component: HomeRouteComponent,
  pendingComponent: HomePageSkeleton,
});

function HomeRouteComponent() {
  const { featuredData } = Route.useLoaderData();
  
  // NO SUSPENSE HERE - Suspense is handled by TanStack Router
  return <HomePage initialFeaturedData={featuredData} />;
}