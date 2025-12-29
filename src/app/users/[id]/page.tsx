import { FileIcon, Github, Twitter, Linkedin, Calendar, Heart } from 'lucide-react'
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

  // Convert post dates
  const postsWithDates = user.posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    user: { ...user, id }
  }))

  return (
    <div className="w-full max-w-4xl mx-auto my-6 sm:my-8 px-2 sm:px-4">
      {/* Profile Card */}
      <div className="relative rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-lg overflow-hidden mb-6 sm:mb-8">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

        {/* Avatar and Info */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 px-5 sm:px-8 pb-6 sm:pb-8 pt-6 sm:pt-8">
          <div className="relative size-24 sm:size-28 border-2 border-primary/20 rounded-full shadow-xl bg-white dark:bg-zinc-900 transition-transform hover:scale-105 ring-2 ring-primary/10">
            <UserAvatar fill src={user.image} alt={user.name} userId={id} />
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start gap-3 mt-1 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-bold">{user.name}</span>
              <UserRoleBadge role={user.role} />
            </div>
            {user.bio && (
              <p className="text-muted-foreground text-center sm:text-left max-w-2xl text-sm sm:text-base leading-relaxed">
                {user.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center mt-1">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              {user.twitter && (
                <a
                  href={user.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Twitter"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="hidden sm:inline">Twitter</span>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              )}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2 rounded-xl bg-muted/40 border border-border/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</span>
              </span>
            </div>
            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20">
                <FileIcon className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">{user.posts.length}</span>
                <span className="text-muted-foreground">{user.posts.length === 1 ? 'post' : 'posts'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800/50">
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-muted-foreground">Total likes:</span>
                <span className="font-bold text-pink-600 dark:text-pink-400">
                  {user.posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-lg px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FileIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            Posts
            {user.posts.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({user.posts.length})
              </span>
            )}
          </h2>
        </div>

        {user.posts.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
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
          <div className="my-16 sm:my-24 flex flex-col items-center justify-center gap-4 py-12">
            <div className="rounded-full bg-muted/50 p-4 sm:p-6">
              <FileIcon className="size-12 sm:size-16 text-muted-foreground" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">No posts yet</div>
            <div className="text-muted-foreground text-sm sm:text-base text-center max-w-md">
              This user hasn't published any posts yet.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPage
