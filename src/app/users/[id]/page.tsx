import { CalendarDaysIcon, FileIcon, GitBranchIcon, HeartIcon, LinkIcon, XIcon } from 'lucide-react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Frame, FrameBody, StripHeader } from '@/components/frame'
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

  const postsWithDates = user.posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    user: { ...user, id }
  }))

  const totalLikes = user.posts.reduce((acc, post) => acc + (post.likeCount || 0), 0)

  const joined = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  const socialLinks = [
    { href: user.github, label: 'GitHub', icon: GitBranchIcon },
    { href: user.twitter, label: 'Twitter', icon: XIcon },
    { href: user.linkedin, label: 'LinkedIn', icon: LinkIcon }
  ].filter((link) => Boolean(link.href))

  return (
    <div className='relative z-10 w-full space-y-6'>
      <Frame as='header'>
        <StripHeader
          left={
            <>
              <span className='text-foreground font-semibold'>Profile // {user.name}</span>
              <span className='hidden sm:inline'>· Joined {joined}</span>
            </>
          }
          right={<span>{user.posts.length} published</span>}
        />

        <FrameBody className='space-y-5'>
          <div className='flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6'>
            <div className='border-border bg-background relative size-24 shrink-0 overflow-hidden border sm:size-28'>
              <UserAvatar
                fill
                src={user.image}
                alt={user.name}
                userId={id}
                sizes='(max-width: 640px) 96px, 112px'
              />
            </div>
            <div className='flex w-full flex-1 flex-col items-center gap-3 sm:items-start'>
              <div className='flex flex-col items-center gap-2 sm:flex-row sm:gap-3'>
                <h1 className='font-heading text-foreground text-2xl font-semibold tracking-tight sm:text-3xl'>
                  {user.name}
                </h1>
                <UserRoleBadge role={user.role} />
              </div>
              {user.bio && (
                <p className='text-muted-foreground max-w-2xl text-center text-sm leading-relaxed sm:text-left sm:text-base'>
                  {user.bio}
                </p>
              )}
              <div className='mt-1 flex flex-wrap items-center gap-2'>
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover-fill border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-colors'
                  >
                    <link.icon className='size-3.5' aria-hidden />
                    <span>{link.label}</span>
                  </a>
                ))}
                <span className='border-border/80 text-muted-foreground inline-flex items-center gap-1.5 border border-dashed px-2.5 py-1.5 font-mono text-[11px] tracking-wider uppercase'>
                  <CalendarDaysIcon className='size-3.5' aria-hidden />
                  <span>{joined}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats row — telemetry style, divided cells */}
          <div className='border-border grid grid-cols-2 border'>
            <div className='border-border flex items-center justify-between p-3.5 sm:border-r'>
              <span className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase'>
                <FileIcon className='size-3.5' aria-hidden />
                Articles
              </span>
              <span className='text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                {user.posts.length}
              </span>
            </div>
            <div className='flex items-center justify-between p-3.5'>
              <span className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase'>
                <HeartIcon className='size-3.5' aria-hidden />
                Appreciations
              </span>
              <span className='text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                {totalLikes.toLocaleString()}
              </span>
            </div>
          </div>
        </FrameBody>
      </Frame>

      <Frame>
        <StripHeader
          left={
            <span className='text-foreground font-semibold'>Posts // Published by {user.name}</span>
          }
          right={<span>{user.posts.length}</span>}
        />
        {user.posts.length > 0 ? (
          <div className='divide-border divide-y'>
            {postsWithDates.map((post) => (
              <PostCard key={post.id} post={post} showAuthor={false} user={formattedCurrentUser} />
            ))}
          </div>
        ) : (
          <FrameBody className='flex flex-col items-center justify-center py-16 text-center'>
            <span className='border-border bg-muted/30 mb-4 flex size-12 items-center justify-center border'>
              <FileIcon className='text-muted-foreground size-5' aria-hidden />
            </span>
            <div className='text-foreground text-base font-semibold'>No posts yet</div>
            <div className='text-muted-foreground mt-1 max-w-md text-sm'>
              This user hasn&apos;t published any posts yet.
            </div>
          </FrameBody>
        )}
      </Frame>
    </div>
  )
}

export default UserPage
