'use client'

import type { Session } from 'next-auth'

import { Bell, Menu as MenuIcon, Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { SITE_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { formatPostDate } from '@/utils/format-post-date'

import CommandMenu from './command-menu'
import { CornerBrackets } from './frame'
import { HoverMark } from './hover-mark'
import Menu from './menu'
import NewPostButton from './new-post-button.lazy'
import ThemeToggle from './theme-toggle'

const NAV_ITEMS = [
  { href: '/', label: '[posts]', match: (p: string) => p === '/' || p.startsWith('/posts') },
  { href: '/roadmaps', label: '[roadmaps]', match: (p: string) => p.startsWith('/roadmaps') },
  { href: '/bookmarks', label: '[bookmarks]', match: (p: string) => p.startsWith('/bookmarks') },
  { href: '/newsletter', label: '[dispatch]', match: (p: string) => p.startsWith('/newsletter') }
]

type Props = {
  user: Session['user'] | null
}

type SearchPost = {
  id: string
  title: string
  description: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string
  }
  likes: Array<{ id: string }>
}

const ClientHeader = ({ user }: Props) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      postId: string
      title: string
      description: string
      createdAt: string
    }>
  >([])
  const [readIds, setReadIds] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let ticking = false
    let lastScrolled = false

    const updateScrolled = () => {
      const next = globalThis.scrollY > 8
      if (next !== lastScrolled) {
        lastScrolled = next
        setIsScrolled(next)
      }
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateScrolled)
      }
    }

    globalThis.addEventListener('scroll', handleScroll, { passive: true })
    updateScrolled()
    return () => globalThis.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    try {
      const stored = globalThis.localStorage.getItem('read_notifications_v1')
      if (stored) {
        const parsed = JSON.parse(stored) as unknown
        if (Array.isArray(parsed)) {
          setReadIds(
            parsed.filter((item): item is string => typeof item === 'string')
          )
        }
      }
    } catch {
      // Ignore storage error
    }

    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : { notifications: [] }))
      .then(
        (data: {
          notifications?: Array<{
            id: string
            postId: string
            title: string
            description: string
            createdAt: string
          }>
        }) => {
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications)
          }
        }
      )
      .catch(() => {
        // Ignore network error
      })
  }, [])

  useEffect(() => {
    if (!isSearchOpen && !isMobileMenuOpen) {
      setSearch('')
      setResults([])
      setShowDropdown(false)
    }
  }, [isSearchOpen, isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [isSearchOpen, isMobileMenuOpen])

  useEffect(() => {
    if (search.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const timeoutId = setTimeout(() => {
      setLoading(true)
      fetch('/api/posts/search')
        .then((res) => res.json())
        .then((data: { posts: SearchPost[] }) => {
          const filtered = data.posts.filter(
            (post) =>
              post.title.toLowerCase().includes(search.toLowerCase()) ||
              post.description.toLowerCase().includes(search.toLowerCase())
          )
          setResults(filtered)
          setShowDropdown(true)
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        notificationButtonRef.current &&
        !notificationsRef.current.contains(e.target as Node) &&
        !notificationButtonRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const handleToggleRead = (notifId: string) => {
    setReadIds((prev) => {
      const next = prev.includes(notifId)
        ? prev.filter((id) => id !== notifId)
        : [...prev, notifId]
      try {
        globalThis.localStorage.setItem(
          'read_notifications_v1',
          JSON.stringify(next)
        )
      } catch {
        // Ignore storage error
      }
      return next
    })
  }

  const handleClearAll = () => {
    const allIds = notifications.map((n) => n.id)
    setReadIds(allIds)
    try {
      globalThis.localStorage.setItem(
        'read_notifications_v1',
        JSON.stringify(allIds)
      )
    } catch {
      // Ignore storage error
    }
  }

  const handleNotificationClick = (notifId: string, postId: string) => {
    if (!readIds.includes(notifId)) {
      handleToggleRead(notifId)
    }
    router.push(`/posts/${postId}`)
    setShowNotifications(false)
    setIsMobileMenuOpen(false)
  }

  const unread = notifications.filter((n) => !readIds.includes(n.id)).length

  const notificationsList = (
    <>
      {notifications.length === 0 ? (
        <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">
          No notifications yet
        </p>
      ) : (
        notifications.map((notif) => {
          const isRead = readIds.includes(notif.id)
          return (
            <HoverMark
              key={notif.id}
              label="Open"
              className={cn(
                'border-b border-border last:border-0 transition-colors',
                !isRead && 'bg-muted/30'
              )}
            >
              <button
                type="button"
                onClick={() => handleNotificationClick(notif.id, notif.postId)}
                className="flex w-full flex-col gap-1 px-4 py-3 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'line-clamp-1 text-xs font-semibold',
                      isRead ? 'text-muted-foreground font-normal' : 'text-foreground'
                    )}
                  >
                    {notif.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {formatPostDate(notif.createdAt, { relative: true })}
                  </span>
                </div>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {notif.description}
                </span>
              </button>
            </HoverMark>
          )
        })
      )}
    </>
  )

  const notificationsPanel = (
    <div className="relative border border-border bg-card shadow-xl">
      <CornerBrackets />
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3.5 py-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
            // DISPATCHES
          </h2>
        </div>
        {unread > 0 ? (
          <span className="border border-border bg-foreground text-background px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider">
            {unread} NEW
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            ALL CAUGHT UP
          </span>
        )}
      </div>
      <div className="max-h-72 divide-y divide-border overflow-y-auto">{notificationsList}</div>
      {notifications.length > 0 && (
        <div className="flex items-center justify-between border-t border-border bg-muted/20 p-2 font-mono text-[10px]">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 text-muted-foreground transition-colors hover:border-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <span>[MARK ALL AS READ]</span>
          </button>
          <span className="text-muted-foreground/60">{notifications.length} TOTAL</span>
        </div>
      )}
    </div>
  )

  const handleSearchResultSelect = (postId: string) => {
    setIsSearchOpen(false)
    setIsMobileMenuOpen(false)
    setShowDropdown(false)
    setSearch('')
    router.push(`/posts/${postId}`)
  }

  const searchResults = (
    <>
      {loading && (
        <p className="p-4 text-center text-sm text-muted-foreground">Loading...</p>
      )}
      {!loading && results.length === 0 && (
        <p className="p-4 text-center text-sm text-muted-foreground">
          No results found.
        </p>
      )}
      {!loading &&
        results.map((post) => (
          <HoverMark
            key={post.id}
            label="Read article"
            className="border-b border-border last:border-0"
          >
            <button
              type="button"
              className="block w-full px-4 py-3 text-left"
              onClick={() => handleSearchResultSelect(post.id)}
            >
              <p className="text-sm font-medium">{post.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {post.description}
              </p>
            </button>
          </HoverMark>
        ))}
    </>
  )

  const searchField = (
    <div className="relative">
      <div className="flex items-center gap-3 border border-border bg-background px-3 py-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          onFocus={() => search && setShowDropdown(true)}
        />
      </div>
      {showDropdown && (
        <div className="absolute inset-x-0 z-50 mt-1 max-h-72 overflow-auto border border-border bg-card">
          {searchResults}
        </div>
      )}
    </div>
  )

  return (
    <header
      className={cn(
        'relative isolate z-50 mx-auto w-full max-w-[90rem] border border-border bg-card',
        isScrolled && 'shadow-sm'
      )}
    >
      <CornerBrackets />
      <div className="mx-auto flex min-h-14 max-w-[90rem] items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none">
          <Link
            href="/"
            className="bracket-title group flex min-w-0 items-center gap-1.5 p-0 sm:gap-2.5 sm:px-2 sm:pr-2"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="size-7 shrink-0 border border-border transition-transform group-hover:scale-105"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-[12px] font-bold tracking-tight sm:text-sm truncate">
                <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  {SITE_NAME}
                </span>
              </p>
              <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase sm:text-[10px] sm:tracking-[0.16em]">
                by Harshhaa
              </p>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 border border-border/70 bg-muted/40 px-2 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-foreground" />
            </span>
            <span>SYS:OK</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1.5 sm:gap-2 md:flex">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 border border-border/80 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
              aria-label="Search articles and run commands (Cmd+K)"
              title="Quick Search (⌘K)"
            >
              <Search className="size-3.5" />
              <span className="hidden lg:inline font-mono text-xs">Search...</span>
              <kbd className="rounded-none border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <nav className="hidden items-center gap-1 sm:flex md:gap-1.5" aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = item.match(pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'border px-2.5 py-1 font-mono text-xs transition-colors duration-150',
                      isActive
                        ? 'border-foreground/80 bg-foreground text-background font-semibold shadow-2xs'
                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="relative">
              <button
                ref={notificationButtonRef}
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  'relative flex size-9 items-center justify-center border text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground cursor-pointer transition-colors',
                  showNotifications ? 'border-border bg-muted text-foreground' : 'border-transparent'
                )}
                aria-label="Show notifications"
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-foreground" />
                )}
              </button>

              {showNotifications && (
                <div
                  ref={notificationsRef}
                  className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)]"
                >
                  {notificationsPanel}
                </div>
              )}
            </div>

          {user?.role === 'admin' && <NewPostButton />}
          <ThemeToggle />
          </div>

          {user?.role === 'admin' && (
            <div className="md:hidden">
              <NewPostButton compact />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden size-9 items-center justify-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground sm:flex md:hidden cursor-pointer"
            aria-label="Open search command palette"
          >
            <Search className="size-4" />
          </button>

          <Menu
            user={
              user
                ? {
                    ...user,
                    emailVerified: null,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt)
                  }
                : null
            }
          />

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex size-8 items-center justify-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground sm:size-9 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="hidden border-t border-border md:block">
          <div className="relative mx-auto max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8">
            {searchField}
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="relative mx-auto max-w-[90rem] px-4 py-4 sm:px-6">
            <div className="relative border border-border bg-card">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-px -left-px z-10 size-2.5 border-t-2 border-l-2 border-foreground/45"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -top-px -right-px z-10 size-2.5 border-t-2 border-r-2 border-foreground/45"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-px -left-px z-10 size-2.5 border-b-2 border-l-2 border-foreground/45"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-px -bottom-px z-10 size-2.5 border-b-2 border-r-2 border-foreground/45"
              />

              <div className="space-y-4 p-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Search
                  </p>
                  {searchField}
                </div>

                <div className="h-px w-full bg-border" />

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Navigation
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {NAV_ITEMS.map((item) => {
                      const isActive = item.match(pathname)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center justify-between border p-2.5 transition-colors',
                            isActive
                              ? 'border-foreground bg-foreground text-background font-semibold'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <span>{item.label}</span>
                          {isActive && <span className="size-1.5 rounded-full bg-background" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="h-px w-full bg-border" />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Notifications
                    </p>
                    {unread > 0 && (
                      <span className="border border-border px-2 py-0.5 text-[10px] font-medium">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div className="border border-border bg-background">
                    <div className="max-h-48 overflow-y-auto">{notificationsList}</div>
                    {notifications.length > 0 && (
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="w-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px w-full bg-border" />

                <div>
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Theme
                  </p>
                  <ThemeToggle className="flex w-full [&>button]:flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        userRole={user?.role}
        isLoggedIn={!!user}
      />
    </header>
  )
}

export default ClientHeader
