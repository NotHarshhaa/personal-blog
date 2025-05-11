import { Separator } from '@tszhong0411/ui'
import { FileIcon, Github, Twitter, Linkedin, Calendar } from 'lucide-react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import PostCard from '@/components/post-card'
import UserAvatar from '@/components/user-avatar'
import UserRoleBadge from '@/components/user-role-badge'
import { getCurrentUser } from '@/lib/auth'
import { SITE_URL } from '@/lib/constants'
import { getUserById } from '@/queries/get-user-by-id'

type UserPageProps = {
  params: Promise<{
    id: string
  }>
}

export const generateMetadata = async (props: UserPageProps): Promise<Metadata> => {
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

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-2 sm:px-4">
      {/* Profile Card */}
      <div className="relative rounded-xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-lg overflow-hidden mb-6">
        {/* Avatar and Info */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-4 mt-2 pb-4 pt-6 sm:pt-8">
          <div className="relative size-16 border-2 border-white dark:border-zinc-900 rounded-full shadow bg-white dark:bg-zinc-900">
            <UserAvatar fill src={user.image} alt={user.name} userId={id} />
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start gap-1 mt-1">
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xl font-bold lg:text-2xl">{user.name}</span>
              <UserRoleBadge role={user.role} />
            </div>
            {user.bio && <p className="text-muted-foreground text-center sm:text-left max-w-xl text-sm">{user.bio}</p>}
            <div className="flex flex-wrap gap-2 items-center mt-1">
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener noreferrer" title="GitHub" className="hover:text-primary transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" className="hover:text-primary transition">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-primary transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                <Calendar className="w-3.5 h-3.5" /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="rounded-2xl border border-border/40 bg-white/80 dark:bg-zinc-900/80 shadow-lg px-2 sm:px-4 py-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileIcon className="w-5 h-5" /> Posts
        </h2>
        <Separator className="mb-4" />
        {user.posts.length > 0 ? (
          <div className="grid gap-6">
            {user.posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, user: { ...user, id } }}
                showAuthor={false}
                user={formattedCurrentUser}
              />
            ))}
          </div>
        ) : (
          <div className="my-24 flex flex-col items-center justify-center gap-3">
            <div className="bg-muted flex size-24 items-center justify-center rounded-full">
              <FileIcon className="size-14" />
            </div>
            <div className="text-2xl font-semibold">No posts yet</div>
            <div className="text-muted-foreground">This user hasn't published any posts yet.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPage
