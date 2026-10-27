'use client'

import {
  BookmarkIcon,
  CheckIcon,
  CompassIcon,
  CopyIcon,
  FileTextIcon,
  HomeIcon,
  LaptopIcon,
  Loader2Icon,
  MailIcon,
  MoonIcon,
  RssIcon,
  SettingsIcon,
  ShieldIcon,
  SunIcon,
  TagIcon,
  UserIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CornerBrackets } from '@/components/frame'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import { SITE_TOPICS, SITE_URL } from '@/lib/constants'

type SearchPost = {
  id: string
  title: string
  description?: string | null
  createdAt: string
  tags?: string[]
  score?: number
  user?: {
    id: string
    name: string
    image?: string | null
  }
}

const STATIC_ITEM_FILTERS = [
  'home blog articles',
  'roadmaps series learning tracks guides devops ai',
  'bookmarks read later saved articles favorite',
  'newsletter dispatch subscribe email notes devops ai',
  'rss feed xml atom syndicate subscribe',
  'privacy policy terms',
  'theme light mode',
  'theme dark mode',
  'theme system mode auto',
  'copy url link share article',
  'copy rss feed link subscribe'
]

type StaticVisibilityArgs = {
  showFullList: boolean
  postsCount: number
  hasHybridResults: boolean
  isLoggedIn: boolean
  isAdmin: boolean
  matches: (value: string) => boolean
}

/** Whether any non-article command item survives the current query filter. */
const hasVisibleStaticItems = (args: StaticVisibilityArgs): boolean => {
  if (args.showFullList && args.postsCount > 0) return true
  if (args.hasHybridResults) return true
  if (
    args.isLoggedIn &&
    (args.matches('my posts drafts articles write') ||
      args.matches('profile settings account danger'))
  ) {
    return true
  }
  if (args.isAdmin && args.matches('admin dashboard metrics engagement')) return true
  if (SITE_TOPICS.some((topic) => args.matches(`topic ${topic}`))) return true
  return STATIC_ITEM_FILTERS.some((filter) => args.matches(filter))
}

type CommandMenuProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  userRole?: string | null
  isLoggedIn?: boolean
}

export const CommandMenu = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  userRole,
  isLoggedIn = false
}: CommandMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedRss, setCopiedRss] = useState(false)

  // Hybrid search state
  const [query, setQuery] = useState('')
  const [hybridPosts, setHybridPosts] = useState<SearchPost[]>([])
  const [isHybridSearching, setIsHybridSearching] = useState(false)

  const router = useRouter()
  const { setTheme } = useTheme()

  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (controlledOnOpenChange) {
        controlledOnOpenChange(value)
      } else {
        setInternalOpen(value)
      }
    },
    [controlledOnOpenChange]
  )

  // Listen for global Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    return () => globalThis.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  // Reset search state when the dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setHybridPosts([])
      setIsHybridSearching(false)
    }
  }, [isOpen])

  // Fetch searchable posts when the command menu opens for the first time
  useEffect(() => {
    if (isOpen && !hasFetched) {
      setLoading(true)
      fetch('/api/posts/search')
        .then((res) => res.json())
        .then((data: { posts?: SearchPost[] }) => {
          if (Array.isArray(data.posts)) {
            setPosts(data.posts)
          }
          setHasFetched(true)
        })
        .catch(() => {
          toast.error('Failed to load searchable articles')
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, hasFetched])

  // Debounced server-side hybrid search while typing
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setHybridPosts([])
      setIsHybridSearching(false)
      return
    }

    setIsHybridSearching(true)
    const timeout = setTimeout(() => {
      fetch(`/api/posts/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data: { posts?: SearchPost[] }) => {
          setHybridPosts(Array.isArray(data.posts) ? data.posts : [])
        })
        .catch(() => setHybridPosts([]))
        .finally(() => setIsHybridSearching(false))
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  const runCommand = useCallback(
    (command: () => void) => {
      setIsOpen(false)
      command()
    },
    [setIsOpen]
  )

  const handleCopyUrl = () => {
    void globalThis.navigator.clipboard.writeText(globalThis.location.href)
    setCopiedUrl(true)
    toast.success('Page URL copied to clipboard')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleCopyRss = () => {
    const rssUrl = `${SITE_URL}/feed.xml`
    void globalThis.navigator.clipboard.writeText(rssUrl)
    setCopiedRss(true)
    toast.success('RSS feed URL copied to clipboard')
    setTimeout(() => setCopiedRss(false), 2000)
  }

  const trimmedQuery = query.trim()
  const queryWords = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean)

  // cmdk runs with shouldFilter={false} — hybrid matches may not literally
  // contain the query tokens, so static groups are filtered manually instead.
  const matches = (value: string) => {
    if (queryWords.length === 0) return true
    const haystack = value.toLowerCase()
    return queryWords.every((word) => haystack.includes(word))
  }

  const hasHybridResults = trimmedQuery.length >= 2 && hybridPosts.length > 0
  const showFullList = trimmedQuery.length < 2
  const showStaticItems = hasVisibleStaticItems({
    showFullList,
    postsCount: posts.length,
    hasHybridResults,
    isLoggedIn,
    isAdmin: userRole === 'admin',
    matches
  })

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      shouldFilter={false}
      title='Command Palette'
      description='Quick search articles, topics, and actions'
    >
      <div className='relative'>
        <CornerBrackets className='text-foreground size-3' />
        <CommandInput
          placeholder='Search DevOps & AI articles, topics, commands...'
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {!showStaticItems && !isHybridSearching && (
            <div className='flex flex-col items-center justify-center gap-2 py-4'>
              <p className='text-foreground text-sm font-medium'>
                {loading ? 'Searching articles...' : 'No results found'}
              </p>
              <p className='text-muted-foreground text-xs'>
                Try searching for Kubernetes, Docker, MLOps, AWS, or Terraform
              </p>
            </div>
          )}

          {isHybridSearching && trimmedQuery.length >= 2 && !hasHybridResults && (
            <div className='text-muted-foreground flex items-center justify-center gap-2 py-6 text-xs'>
              <Loader2Icon className='size-3.5 animate-spin' />
              Searching articles...
            </div>
          )}

          {/* Ranked full-text search matches */}
          {hasHybridResults && (
            <CommandGroup heading='Search Results'>
              {hybridPosts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onSelect={() => runCommand(() => router.push(`/posts/${post.id}`))}
                />
              ))}
            </CommandGroup>
          )}

          {/* Full list when no query yet */}
          {showFullList && posts.length > 0 && (
                <CommandGroup heading='Published Articles'>
                  {posts
                    .filter((post) =>
                      matches(
                        `${post.title} ${post.description ?? ''} ${post.tags?.join(' ') ?? ''}`
                      )
                    )
                    .map((post) => (
                      <PostItem
                        key={post.id}
                        post={post}
                        onSelect={() => runCommand(() => router.push(`/posts/${post.id}`))}
                      />
                    ))}
                </CommandGroup>
              )}

              <CommandSeparator />

              {/* Topic Filters */}
              <CommandGroup heading='Topics & Technology'>
                <div className='grid grid-cols-1 gap-1 sm:grid-cols-2'>
                  {SITE_TOPICS.filter((topic) => matches(`topic ${topic}`)).map((topic) => (
                    <CommandItem
                      key={topic}
                      value={`topic ${topic}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/?tag=${encodeURIComponent(topic)}`))
                      }
                      className='cursor-pointer'
                    >
                      <TagIcon className='text-muted-foreground size-3.5 shrink-0' />
                      <span className='font-mono text-xs tracking-wider uppercase'>#{topic}</span>
                      <CommandShortcut className='font-mono text-[9px]'>Filter</CommandShortcut>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>

              <CommandSeparator />

              {/* Navigation */}
              <CommandGroup heading='Navigation'>
                <NavItems
                  matches={matches}
                  userRole={userRole}
                  isLoggedIn={isLoggedIn}
                  runCommand={runCommand}
                  router={router}
                />
              </CommandGroup>

              <CommandSeparator />

              {/* Appearance & Quick Actions */}
              <CommandGroup heading='Appearance & Tools'>
                <ActionItems
                  matches={matches}
                  runCommand={runCommand}
                  setTheme={setTheme}
                  copiedUrl={copiedUrl}
                  copiedRss={copiedRss}
                  handleCopyUrl={handleCopyUrl}
                  handleCopyRss={handleCopyRss}
                />
              </CommandGroup>
        </CommandList>

        {/* Keyboard Shortcuts Footer */}
        <div className='border-border bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 font-mono text-[11px] select-none'>
          <div className='flex items-center gap-3'>
            <span className='flex items-center gap-1.5'>
              <kbd className='border-border bg-background text-foreground border px-1.5 py-0.5 text-[10px]'>
                ↑↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className='flex items-center gap-1.5'>
              <kbd className='border-border bg-background text-foreground border px-1.5 py-0.5 text-[10px]'>
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>
          <div className='flex items-center gap-2.5'>
            <span className='text-muted-foreground/70 hidden sm:inline'>DevOps, Cloud & AI</span>
            <span className='flex items-center gap-1'>
              <kbd className='border-border bg-background text-foreground border px-1.5 py-0.5 text-[10px]'>
                ESC
              </kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </CommandDialog>
  )
}

type PostItemProps = {
  post: SearchPost
  onSelect: () => void
  showScore?: boolean
}

const PostItem = ({ post, onSelect, showScore = false }: PostItemProps) => (
  <CommandItem
    value={`${post.title} ${post.description ?? ''} ${post.tags?.join(' ') ?? ''}`}
    onSelect={onSelect}
    className='group flex items-start gap-3 py-3'
  >
    <div className='border-border bg-background group-data-[selected=true]:border-foreground group-data-[selected=true]:bg-foreground group-data-[selected=true]:text-background mt-0.5 flex size-7 shrink-0 items-center justify-center border transition-colors'>
      <FileTextIcon className='size-3.5' />
    </div>
    <div className='flex min-w-0 flex-1 flex-col gap-1'>
      <span className='text-foreground truncate font-medium group-data-[selected=true]:font-semibold'>
        {post.title}
      </span>
      {post.description && (
        <span className='text-muted-foreground group-data-[selected=true]:text-foreground/90 line-clamp-2 text-xs leading-relaxed'>
          {post.description}
        </span>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-1'>
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className='border-border/80 bg-background/80 text-muted-foreground group-data-[selected=true]:border-foreground/60 group-data-[selected=true]:text-foreground border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase'
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
    {showScore && typeof post.score === 'number' && (
      <span className='border-border bg-muted/40 text-muted-foreground mt-0.5 shrink-0 border px-1.5 py-0.5 font-mono text-[9px]'>
        {post.score.toFixed(3)}
      </span>
    )}
  </CommandItem>
)

type FilterFn = (value: string) => boolean

type NavItemsProps = {
  matches: FilterFn
  userRole?: string | null
  isLoggedIn: boolean
  runCommand: (command: () => void) => void
  router: ReturnType<typeof useRouter>
}

const NavItems = ({ matches, userRole, isLoggedIn, runCommand, router }: NavItemsProps) => (
  <>
    {matches('home blog articles') && (
      <CommandItem
        value='home blog articles'
        onSelect={() => runCommand(() => router.push('/'))}
        className='cursor-pointer'
      >
        <HomeIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Home</span>
      </CommandItem>
    )}

    {matches('roadmaps series learning tracks guides devops ai') && (
      <CommandItem
        value='roadmaps series learning tracks guides devops ai'
        onSelect={() => runCommand(() => router.push('/roadmaps'))}
        className='cursor-pointer'
      >
        <CompassIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Learning Roadmaps & Series</span>
        <CommandShortcut className='font-mono text-[10px]'>Roadmaps</CommandShortcut>
      </CommandItem>
    )}

    {matches('bookmarks read later saved articles favorite') && (
      <CommandItem
        value='bookmarks read later saved articles favorite'
        onSelect={() => runCommand(() => router.push('/bookmarks'))}
        className='cursor-pointer'
      >
        <BookmarkIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Bookmarks & Read Later</span>
        <CommandShortcut className='font-mono text-[10px]'>Saved</CommandShortcut>
      </CommandItem>
    )}

    {matches('newsletter dispatch subscribe email notes devops ai') && (
      <CommandItem
        value='newsletter dispatch subscribe email notes devops ai'
        onSelect={() => runCommand(() => router.push('/newsletter'))}
        className='cursor-pointer'
      >
        <MailIcon className='text-muted-foreground size-4 shrink-0' />
        <span>DevOps & AI Dispatch</span>
        <CommandShortcut className='font-mono text-[10px]'>Newsletter</CommandShortcut>
      </CommandItem>
    )}

    {isLoggedIn && matches('my posts drafts articles write') && (
      <CommandItem
        value='my posts drafts articles write'
        onSelect={() => runCommand(() => router.push('/me/posts'))}
        className='cursor-pointer'
      >
        <UserIcon className='text-muted-foreground size-4 shrink-0' />
        <span>My Posts & Drafts</span>
      </CommandItem>
    )}

    {isLoggedIn && matches('profile settings account danger') && (
      <CommandItem
        value='profile settings account danger'
        onSelect={() => runCommand(() => router.push('/me/settings'))}
        className='cursor-pointer'
      >
        <SettingsIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Account Settings</span>
      </CommandItem>
    )}

    {userRole === 'admin' && matches('admin dashboard metrics engagement') && (
      <CommandItem
        value='admin dashboard metrics engagement'
        onSelect={() => runCommand(() => router.push('/admin'))}
        className='cursor-pointer'
      >
        <ShieldIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Admin Dashboard</span>
        <CommandShortcut className='font-mono text-[10px]'>Admin</CommandShortcut>
      </CommandItem>
    )}

    {matches('rss feed xml atom syndicate subscribe') && (
      <CommandItem
        value='rss feed xml atom syndicate subscribe'
        onSelect={() => runCommand(() => router.push('/feed.xml'))}
        className='cursor-pointer'
      >
        <RssIcon className='text-foreground size-4 shrink-0' />
        <span>RSS Feed (/feed.xml)</span>
        <CommandShortcut className='font-mono text-[10px]'>XML</CommandShortcut>
      </CommandItem>
    )}

    {matches('privacy policy terms') && (
      <CommandItem
        value='privacy policy terms'
        onSelect={() => runCommand(() => router.push('/privacy'))}
        className='cursor-pointer'
      >
        <CompassIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Privacy Policy</span>
      </CommandItem>
    )}
  </>
)

type ActionItemsProps = {
  matches: FilterFn
  runCommand: (command: () => void) => void
  setTheme: (theme: string) => void
  copiedUrl: boolean
  copiedRss: boolean
  handleCopyUrl: () => void
  handleCopyRss: () => void
}

const ActionItems = ({
  matches,
  runCommand,
  setTheme,
  copiedUrl,
  copiedRss,
  handleCopyUrl,
  handleCopyRss
}: ActionItemsProps) => (
  <>
    {matches('theme light mode') && (
      <CommandItem
        value='theme light mode'
        onSelect={() => runCommand(() => setTheme('light'))}
        className='cursor-pointer'
      >
        <SunIcon className='text-foreground size-4 shrink-0' />
        <span>Switch to Light Theme</span>
      </CommandItem>
    )}

    {matches('theme dark mode') && (
      <CommandItem
        value='theme dark mode'
        onSelect={() => runCommand(() => setTheme('dark'))}
        className='cursor-pointer'
      >
        <MoonIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Switch to Dark Theme</span>
      </CommandItem>
    )}

    {matches('theme system mode auto') && (
      <CommandItem
        value='theme system mode auto'
        onSelect={() => runCommand(() => setTheme('system'))}
        className='cursor-pointer'
      >
        <LaptopIcon className='text-muted-foreground size-4 shrink-0' />
        <span>Use System Theme</span>
      </CommandItem>
    )}

    {matches('copy url link share article') && (
      <CommandItem
        value='copy url link share article'
        onSelect={() => runCommand(handleCopyUrl)}
        className='cursor-pointer'
      >
        {copiedUrl ? (
          <CheckIcon className='text-foreground size-4 shrink-0' />
        ) : (
          <CopyIcon className='text-muted-foreground size-4 shrink-0' />
        )}
        <span>Copy Current Page URL</span>
      </CommandItem>
    )}

    {matches('copy rss feed link subscribe') && (
      <CommandItem
        value='copy rss feed link subscribe'
        onSelect={() => runCommand(handleCopyRss)}
        className='cursor-pointer'
      >
        {copiedRss ? (
          <CheckIcon className='text-foreground size-4 shrink-0' />
        ) : (
          <RssIcon className='text-muted-foreground size-4 shrink-0' />
        )}
        <span>Copy RSS Feed Link</span>
      </CommandItem>
    )}
  </>
)

export default CommandMenu
