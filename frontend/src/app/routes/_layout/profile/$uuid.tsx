import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense, lazy, useEffect } from 'react'
import { requireOwnerProfileCompletion } from '@/utils/routeGuards'
import { UsersService } from '@/client'
import ProfilePageSkeleton from '@/skeletons/profilPage/Index'
import { createServerFn } from '@tanstack/react-start'
import { generateProfileSEO } from '@/seo/profileSeo'
import { fetchCurrentUser } from '@/hooks/auth/useAuthQuery'

const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

const getProfileData = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const uuid = ctx.data as unknown as string

  try {
    const publicData = await UsersService.getUserApiV1UsersIdentifierGet({
      identifier: uuid,
    })
    return { publicData }
  } catch (error) {
    console.error('Failed to load profile data:', error)
    return { publicData: null }
  }
})

export const Route = createFileRoute('/_layout/profile/$uuid')({
  beforeLoad: async ({ params, location }) => {
    const result = await requireOwnerProfileCompletion(params.uuid, location)
    return result
  },

  loader: async ({ params }) => {
    return await getProfileData({ data: params.uuid })
  },

  head: ({ loaderData }) => {
    const { publicData } = loaderData || {}

    return {
      meta: generateProfileSEO(publicData),
    }
  },

  validateSearch: (search: Record<string, unknown>) => ({
    pt: (search.pt as string) ?? 'about',
    st: (search.st as string) ?? 'services',
    drawer: search.drawer as string | undefined,
    step: search.step as string | undefined,
    redirectTo: search.redirectTo as string | undefined,
    serviceModal: (search.serviceModal as 'create' | 'edit' | undefined) ?? undefined,
    serviceId: (search.serviceId as string | undefined) ?? undefined,
    sessionModal: search.sessionModal as 'create' | 'edit' | undefined,
    sessionId: search.sessionId as string | undefined,
    sessionDetailId: search.sessionDetailId as string | undefined,
    settings: search.settings as 'open' | undefined,
  }),

  component: ProfileRouteComponent,
})

function ProfileRouteComponent() {
  const { publicData } = Route.useLoaderData()
  const navigate = useNavigate()
  const { uuid } = Route.useParams()
  // const search = Route.useSearch()

  // Debug logging
  console.log('🎨 ProfileRouteComponent rendering', {
    isServer: typeof window === 'undefined',
    hasPublicData: !!publicData,
    uuid
  })

  useEffect(() => {
    console.log('✅ Client hydrated successfully')
  }, [])
  // Client-side auth check after hydration
  useEffect(() => {
    let mounted = true

    const checkAuthAndRedirect = async () => {
      try {
        const user = await fetchCurrentUser()

        if (!mounted) return

        // If viewing own profile and setup incomplete, redirect
        if (user && user.uuid === uuid && !user?.profile?.is_profile_setup_complete) {
          const currentPath = window.location.pathname
          const currentSearch = new URLSearchParams(window.location.search).toString()

          navigate({
            to: '/profile-setup',
            search: {
              step: 1,
              redirectTo: currentPath + (currentSearch ? '?' + currentSearch : ''),
            },
            replace: true, // Use replace to avoid back button issues
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }

    checkAuthAndRedirect()

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