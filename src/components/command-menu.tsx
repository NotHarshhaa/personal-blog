'use client'

import {
  CheckIcon,
  CompassIcon,
  CopyIcon,
  FileTextIcon,
  HomeIcon,
  LaptopIcon,
  MoonIcon,
  RssIcon,
  SettingsIcon,
  ShieldIcon,
  SunIcon,
  TagIcon,
  UserIcon} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCallback,useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  CommandDialog,
  CommandEmpty,
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
  user?: {
    id: string
    name: string
    image?: string | null
  }
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

  // Fetch searchable posts when the command menu opens for the first time
  useEffect(() => {
    if (isOpen && !hasFetched) {
      setLoading(true)
      fetch('/api/posts/search')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.posts)) {
            setPosts(data.posts as SearchPost[])
          }
          setHasFetched(true)
        })
        .catch(() => {
          toast.error('Failed to load searchable articles')
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, hasFetched])

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
    void navigator.clipboard.writeText(rssUrl)
    setCopiedRss(true)
    toast.success('RSS feed URL copied to clipboard')
    setTimeout(() => setCopiedRss(false), 2000)
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Command Palette"
      description="Quick search articles, topics, and actions"
    >
      <CommandInput placeholder="Type a command or search articles..." />
      <CommandList>
        <CommandEmpty>
          {loading ? 'Loading articles...' : 'No matching results found.'}
        </CommandEmpty>

        {/* Articles Search */}
        {posts.length > 0 && (
          <CommandGroup heading="Articles">
            {posts.slice(0, 8).map((post) => (
              <CommandItem
                key={post.id}
                value={`${post.title} ${post.description ?? ''} ${post.tags?.join(' ') ?? ''}`}
                onSelect={() => runCommand(() => router.push(`/posts/${post.id}`))}
                className="cursor-pointer"
              >
                <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{post.title}</span>
                  {post.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {post.description}
                    </span>
                  )}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <span className="hidden font-mono text-[10px] text-muted-foreground uppercase sm:inline">
                    #{post.tags[0]}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Topic Filters */}
        <CommandGroup heading="Explore Topics">
          {SITE_TOPICS.map((topic) => (
            <CommandItem
              key={topic}
              value={`topic ${topic}`}
              onSelect={() =>
                runCommand(() =>
                  router.push(`/?tag=${encodeURIComponent(topic)}`)
                )
              }
              className="cursor-pointer"
            >
              <TagIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>#{topic}</span>
              <CommandShortcut className="font-mono text-[10px]">
                Topic
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            value="home blog articles"
            onSelect={() => runCommand(() => router.push('/'))}
            className="cursor-pointer"
          >
            <HomeIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>Home</span>
          </CommandItem>

          {isLoggedIn && (
            <CommandItem
              value="my posts drafts"
              onSelect={() => runCommand(() => router.push('/me/posts'))}
              className="cursor-pointer"
            >
              <UserIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>My Posts & Drafts</span>
            </CommandItem>
          )}

          {isLoggedIn && (
            <CommandItem
              value="profile settings account"
              onSelect={() => runCommand(() => router.push('/me/settings'))}
              className="cursor-pointer"
            >
              <SettingsIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Account Settings</span>
            </CommandItem>
          )}

          {userRole === 'admin' && (
            <CommandItem
              value="admin dashboard metrics"
              onSelect={() => runCommand(() => router.push('/admin'))}
              className="cursor-pointer"
            >
              <ShieldIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Admin Dashboard</span>
              <CommandShortcut className="font-mono text-[10px]">
                Admin
              </CommandShortcut>
            </CommandItem>
          )}

          <CommandItem
            value="rss feed xml atom syndicate"
            onSelect={() => runCommand(() => router.push('/feed.xml'))}
            className="cursor-pointer"
          >
            <RssIcon className="size-4 shrink-0 text-amber-500" />
            <span>RSS Feed (/feed.xml)</span>
          </CommandItem>

          <CommandItem
            value="privacy policy terms"
            onSelect={() => runCommand(() => router.push('/privacy'))}
            className="cursor-pointer"
          >
            <CompassIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>Privacy Policy</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Appearance & Quick Actions */}
        <CommandGroup heading="Theme & Actions">
          <CommandItem
            value="theme light mode"
            onSelect={() => runCommand(() => setTheme('light'))}
            className="cursor-pointer"
          >
            <SunIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>Light Theme</span>
          </CommandItem>

          <CommandItem
            value="theme dark mode"
            onSelect={() => runCommand(() => setTheme('dark'))}
            className="cursor-pointer"
          >
            <MoonIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>Dark Theme</span>
          </CommandItem>

          <CommandItem
            value="theme system mode auto"
            onSelect={() => runCommand(() => setTheme('system'))}
            className="cursor-pointer"
          >
            <LaptopIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>System Theme</span>
          </CommandItem>

          <CommandItem
            value="copy url link share"
            onSelect={() => runCommand(handleCopyUrl)}
            className="cursor-pointer"
          >
            {copiedUrl ? (
              <CheckIcon className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <CopyIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span>Copy Current Page URL</span>
          </CommandItem>

          <CommandItem
            value="copy rss feed link subscribe"
            onSelect={() => runCommand(handleCopyRss)}
            className="cursor-pointer"
          >
            {copiedRss ? (
              <CheckIcon className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <RssIcon className="size-4 shrink-0 text-amber-500" />
            )}
            <span>Copy RSS Feed URL</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export default CommandMenu
