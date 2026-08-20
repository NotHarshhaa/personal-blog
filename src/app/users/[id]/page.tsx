import {
  FileIcon,
  Github,
  Twitter,
  Linkedin,
  Calendar,
  Heart
} from 'lucide-react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import PostCard from '@/components/post-card'
import UserAvatar from '@/components/user-avatar'
import UserRoleBadge from '@/components/user-role-badge'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'
import { SITE_URL } from '@/lib/constants'
import { getUserById } from '@/queries/get-user-by-id'

type UserPageProps = {
  params: Promise<{
    id: string
  }>
}

export const generateMetadata = async (
  props: UserPageProps
): Promise<Metadata> => {
  const { id } = await props.params

  const { user } = await getUserById(id)

  if (!user) {
    return {}
  }

  return {
    title: user.name,
    description: user.bio,
    openGraph: {
      title: user.name,
      description: user.bio ?? undefined,
      type: 'profile',
      url: `${SITE_URL}/users/${id}`
    }
  }
}

const UserPage = async (props: UserPageProps) => {
  const { id } = await props.params
  const currentUser = await getCurrentUser()
  const formattedCurrentUser = currentUser
    ? {
        ...currentUser,
        createdAt: new Date(currentUser.createdAt),
        updatedAt: new Date(currentUser.updatedAt)
      }
    : null
  const { user } = await getUserById(id)

  if (!user) {
    notFound()
  }

  const postsWithDates = user.posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    user: { ...user, id }
  }))

  const totalLikes = user.posts.reduce(
    (acc, post) => acc + (post.likeCount || 0),
    0
  )

  return (
    <div className="relative z-10 w-full space-y-6">
      <Frame>
        <FrameHeader label="Profile" />
        <FrameBody>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative size-24 shrink-0 overflow-hidden border border-border bg-background sm:size-28">
              <UserAvatar fill src={user.image} alt={user.name} userId={id} />
            </div>
            <div className="flex w-full flex-1 flex-col items-center gap-3 sm:items-start">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {user.name}
                </h1>
                <UserRoleBadge role={user.role} />
              </div>
              {user.bio && (
                <p className="max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-left sm:text-base">
                  {user.bio}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <Github className="size-4" />
                    <span className="hidden sm:inline">GitHub</span>
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={user.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter"
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <Twitter className="size-4" />
                    <span className="hidden sm:inline">Twitter</span>
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <Linkedin className="size-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Joined{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : '—'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5">
                  <FileIcon className="size-4 text-muted-foreground" />
                  <span className="font-semibold">{user.posts.length}</span>
                  <span className="text-muted-foreground">
                    {user.posts.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5">
                  <Heart className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-semibold">{totalLikes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </FrameBody>
      </Frame>

      <Frame>
        <FrameHeader label="Posts">
          {user.posts.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {user.posts.length}
            </span>
          )}
        </FrameHeader>
        {user.posts.length > 0 ? (
          <div className="divide-y divide-border">
            {postsWithDates.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showAuthor={false}
                user={formattedCurrentUser}
              />
            ))}
          </div>
        ) : (
          <FrameBody className="flex flex-col items-center justify-center py-16 text-center">
            <FileIcon className="mb-4 size-12 text-muted-foreground" />
            <div className="text-lg font-semibold">No posts yet</div>
            <div className="mt-1 max-w-md text-sm text-muted-foreground">
              This user hasn&apos;t published any posts yet.
            </div>
          </FrameBody>
        )}
      </Frame>
    </div>
  )
}

export default UserPage
