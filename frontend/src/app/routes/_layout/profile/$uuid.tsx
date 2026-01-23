import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { requireOwnerProfileCompletion } from '@/utils/routeGuards'
import { UsersService } from '@/client'
import ProfilePageSkeleton from '@/skeletons/profilPage/Index'
import { createServerFn } from '@tanstack/react-start'
import { generateProfileSEO } from '@/seo/profileSeo'

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

  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePage initialPublicData={publicData} />
    </Suspense>
  )
}