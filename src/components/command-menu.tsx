'use client'

import {
  BookmarkIcon,
  CheckIcon,
  CompassIcon,
  CopyIcon,
  FileTextIcon,
  HomeIcon,
  LaptopIcon,
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

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Command Palette"
      description="Quick search articles, topics, and actions"
    >
      <div className="relative">
        <CornerBrackets className="size-3 text-foreground" />
        <CommandInput placeholder="Search DevOps & AI articles, topics, commands..." />

        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <p className="text-sm font-medium text-foreground">
                {loading ? 'Searching articles...' : 'No results found'}
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching for Kubernetes, Docker, MLOps, AWS, or Terraform
              </p>
            </div>
          </CommandEmpty>

          {/* Articles Search */}
          {posts.length > 0 && (
            <CommandGroup heading="Published Articles">
              {posts.map((post) => (
                <CommandItem
                  key={post.id}
                  value={`${post.title} ${post.description ?? ''} ${post.tags?.join(' ') ?? ''}`}
                  onSelect={() => runCommand(() => router.push(`/posts/${post.id}`))}
                  className="group flex items-start gap-3 py-3"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-border bg-background transition-colors group-data-[selected=true]:border-foreground group-data-[selected=true]:bg-foreground group-data-[selected=true]:text-background">
                    <FileTextIcon className="size-3.5" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-medium text-foreground group-data-[selected=true]:font-semibold">
                      {post.title}
                    </span>
                    {post.description && (
                      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground group-data-[selected=true]:text-foreground/90">
                        {post.description}
                      </span>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground group-data-[selected=true]:border-foreground/60 group-data-[selected=true]:text-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Topic Filters */}
          <CommandGroup heading="Topics & Technology">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
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
                  <TagIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    #{topic}
                  </span>
                  <CommandShortcut className="font-mono text-[9px]">
                    Filter
                  </CommandShortcut>
                </CommandItem>
              ))}
            </div>
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

            <CommandItem
              value="roadmaps series learning tracks guides devops ai"
              onSelect={() => runCommand(() => router.push('/roadmaps'))}
              className="cursor-pointer"
            >
              <CompassIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Learning Roadmaps & Series</span>
              <CommandShortcut className="font-mono text-[10px]">
                Roadmaps
              </CommandShortcut>
            </CommandItem>

            <CommandItem
              value="bookmarks read later saved articles favorite"
              onSelect={() => runCommand(() => router.push('/bookmarks'))}
              className="cursor-pointer"
            >
              <BookmarkIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Bookmarks & Read Later</span>
              <CommandShortcut className="font-mono text-[10px]">
                Saved
              </CommandShortcut>
            </CommandItem>

            <CommandItem
              value="newsletter dispatch subscribe email notes devops ai"
              onSelect={() => runCommand(() => router.push('/newsletter'))}
              className="cursor-pointer"
            >
              <MailIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>DevOps & AI Dispatch</span>
              <CommandShortcut className="font-mono text-[10px]">
                Newsletter
              </CommandShortcut>
            </CommandItem>

            {isLoggedIn && (
              <CommandItem
                value="my posts drafts articles write"
                onSelect={() => runCommand(() => router.push('/me/posts'))}
                className="cursor-pointer"
              >
                <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                <span>My Posts & Drafts</span>
              </CommandItem>
            )}

            {isLoggedIn && (
              <CommandItem
                value="profile settings account danger"
                onSelect={() => runCommand(() => router.push('/me/settings'))}
                className="cursor-pointer"
              >
                <SettingsIcon className="size-4 shrink-0 text-muted-foreground" />
                <span>Account Settings</span>
              </CommandItem>
            )}

            {userRole === 'admin' && (
              <CommandItem
                value="admin dashboard metrics engagement"
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
              value="rss feed xml atom syndicate subscribe"
              onSelect={() => runCommand(() => router.push('/feed.xml'))}
              className="cursor-pointer"
            >
              <RssIcon className="size-4 shrink-0 text-amber-500" />
              <span>RSS Feed (/feed.xml)</span>
              <CommandShortcut className="font-mono text-[10px]">
                XML
              </CommandShortcut>
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
          <CommandGroup heading="Appearance & Tools">
            <CommandItem
              value="theme light mode"
              onSelect={() => runCommand(() => setTheme('light'))}
              className="cursor-pointer"
            >
              <SunIcon className="size-4 shrink-0 text-amber-500" />
              <span>Switch to Light Theme</span>
            </CommandItem>

            <CommandItem
              value="theme dark mode"
              onSelect={() => runCommand(() => setTheme('dark'))}
              className="cursor-pointer"
            >
              <MoonIcon className="size-4 shrink-0 text-blue-400" />
              <span>Switch to Dark Theme</span>
            </CommandItem>

            <CommandItem
              value="theme system mode auto"
              onSelect={() => runCommand(() => setTheme('system'))}
              className="cursor-pointer"
            >
              <LaptopIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Use System Theme</span>
            </CommandItem>

            <CommandItem
              value="copy url link share article"
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
              <span>Copy RSS Feed Link</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Keyboard Shortcuts Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 font-mono text-[11px] text-muted-foreground select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden text-muted-foreground/70 sm:inline">
              DevOps, Cloud & AI
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground">
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

export default CommandMenu
