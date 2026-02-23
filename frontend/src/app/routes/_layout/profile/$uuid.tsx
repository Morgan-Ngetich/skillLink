import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense, lazy, useEffect } from 'react'
import { UsersService } from '@/client'
import ProfilePageSkeleton from '@/skeletons/profilPage/Index'
import { generateProfileSEO } from '@/seo/profileSeo'
import { generateSessionSEO } from '@/seo/sessionSeo'
import { fetchCurrentUser } from '@/hooks/auth/useAuthQuery'
import { toNativePromise } from '@/utils/toNativePromisse'

const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

async function fetchProfileData(uuid: string) {
  try {
    const publicData = await toNativePromise(
      UsersService.getUserApiV1UsersIdentifierGet({ identifier: uuid })
    )
    return { publicData }
  } catch (error) {
    console.error('Failed to load profile data:', error)
    return { publicData: null }
  }
}

export const Route = createFileRoute('/_layout/profile/$uuid')({
  loader: async ({ params }) => {
    return await fetchProfileData(params.uuid)
  },

  head: ({ loaderData, match }) => {
    const { publicData } = loaderData || {}
    const sessionDetailId = (match?.search as Record<string, string>)?.sessionDetailId

    // If a session is being shared, find it in the already-loaded profile data
    if (sessionDetailId && publicData?.profile?.mentor_profile?.sessions) {
      const session = publicData.profile.mentor_profile.sessions.find(
        (s) => s.uuid === sessionDetailId
      )
      if (session) {
        return {
          meta: generateSessionSEO(session, publicData.full_name),
        }
      }
    }

    // Default: profile SEO
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

  useEffect(() => {
    let mounted = true

    const checkAuthAndRedirect = async () => {
      try {
        const user = await fetchCurrentUser({ skipCache: true })
        if (!mounted) return
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
      }
    }

    if (typeof window !== 'undefined') {
      checkAuthAndRedirect()
    }

    return () => { mounted = false }
  }, [uuid, navigate])

  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePage initialPublicData={publicData} />
    </Suspense>
  )
}