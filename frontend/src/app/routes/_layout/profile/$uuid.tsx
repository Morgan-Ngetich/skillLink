import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense, lazy, useEffect } from 'react'
import { UsersService } from '@/client'
import ProfilePageSkeleton from '@/skeletons/profilPage/Index'
import { generateProfileSEO } from '@/seo/profileSeo'
import { fetchCurrentUser } from '@/hooks/auth/useAuthQuery'
import { toNativePromise } from '@/utils/toNativePromisse'

const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

async function fetchProfileData(uuid: string) {
  try {
    const publicData = await toNativePromise(
      UsersService.getUserApiV1UsersIdentifierGet({
        identifier: uuid,
      })
    )
    return { publicData }
  } catch (error) {
    console.error('Failed to load profile data:', error)
    return { publicData: null }
  }
}

export const Route = createFileRoute('/_layout/profile/$uuid')({
  loader: async ({ params }) => {
    // Only fetch public data in loader (SSR-safe)
    const profileData = await fetchProfileData(params.uuid)
    return profileData
  },

  head: ({ loaderData }) => {
    const { publicData } = loaderData || {}
    return {
      meta: generateProfileSEO(publicData),
    }
  },

  validateSearch: (search: Record<string, unknown>) => ({
    pt: (search.pt as string) ?? 'about',
    st: (search.st as string) ?? 'sessions',
    drawer: (search.drawer as string | undefined) ?? undefined,
    step: (search.step as string | undefined) ?? undefined,
    redirectTo: (search.redirectTo as string | undefined) ?? undefined,
    serviceModal: (search.serviceModal as 'create' | 'edit' | undefined) ?? undefined,
    serviceId: (search.serviceId as string | undefined) ?? undefined,
    sessionModal: (search.sessionModal as 'create' | 'edit' | undefined) ?? undefined,
    sessionId: (search.sessionId as string | undefined) ?? undefined,
    sessionDetailId: (search.sessionDetailId as string | undefined) ?? undefined,
    settings: (search.settings as 'open' | undefined) ?? undefined,
  }),

  component: ProfileRouteComponent,
  pendingComponent: ProfilePageSkeleton,
})

function ProfileRouteComponent() {
  const { publicData } = Route.useLoaderData()
  const navigate = useNavigate()
  const { uuid } = Route.useParams()

  // Client-side only: Check auth and redirect if needed
  useEffect(() => {
    let mounted = true

    const checkAuthAndRedirect = async () => {
      try {
        const user = await fetchCurrentUser({ skipCache: true })

        if (!mounted) return

        // If viewing own profile and setup incomplete, redirect
        if (user && user.uuid === uuid && !user?.profile?.is_profile_setup_complete) {
          navigate({
            to: '/profile-setup',
            search: {
              step: 1,
              redirectTo: window.location.pathname,
              redirectSearch: window.location.search.slice(1),
            },
            replace: true,
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Fail silently - user can still view profile as public
      }
    }

    // Only run on client
    if (typeof window !== 'undefined') {
      checkAuthAndRedirect()
    }

    return () => {
      mounted = false
    }
  }, [uuid, navigate])

  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePage initialPublicData={publicData} />
    </Suspense>
  )
}