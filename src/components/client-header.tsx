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
  { href: '/', label: 'Posts', match: (p: string) => p === '/' || p.startsWith('/posts') },
  { href: '/snippets', label: 'Vault', match: (p: string) => p.startsWith('/snippets') },
  { href: '/roadmaps', label: 'Roadmaps', match: (p: string) => p.startsWith('/roadmaps') },
  { href: '/bookmarks', label: 'Bookmarks', match: (p: string) => p.startsWith('/bookmarks') },
  { href: '/newsletter', label: 'Dispatch', match: (p: string) => p.startsWith('/newsletter') }
]

type Props = {
  user: Session['user'] | null
}

type SearchPost = {
  id: string
  title: string
  description: string | null
  createdAt: string
  tags?: string[]
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
          setReadIds(parsed.filter((item): item is string => typeof item === 'string'))
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
    setIsMobileMenuOpen(false)
    setShowNotifications(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    document.body.style.overflow = 'hidden'
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [isSearchOpen, isMobileMenuOpen])

  useEffect(() => {
    const query = search.trim()
    if (query.length === 0) {
      setResults([])
      setShowDropdown(false)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      setLoading(true)
      fetch(`/api/posts/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Search request failed')
          return res.json()
        })
        .then((data: { posts: SearchPost[] }) => {
          const normalizedQuery = query.toLowerCase()
          const filtered = data.posts.filter(
            (post) =>
              post.title.toLowerCase().includes(normalizedQuery) ||
              (post.description?.toLowerCase().includes(normalizedQuery) ?? false) ||
              post.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
          )
          setResults(filtered)
          setShowDropdown(true)
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return
          setResults([])
          setShowDropdown(true)
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
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
      const next = prev.includes(notifId) ? prev.filter((id) => id !== notifId) : [...prev, notifId]
      try {
        globalThis.localStorage.setItem('read_notifications_v1', JSON.stringify(next))
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
      globalThis.localStorage.setItem('read_notifications_v1', JSON.stringify(allIds))
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
        <p className='text-muted-foreground px-4 py-6 text-center font-mono text-xs'>
          No notifications yet
        </p>
      ) : (
        notifications.map((notif) => {
          const isRead = readIds.includes(notif.id)
          return (
            <HoverMark
              key={notif.id}
              label='Open'
              className={cn(
                'border-border border-b transition-colors last:border-0',
                !isRead && 'bg-muted/30'
              )}
            >
              <button
                type='button'
                onClick={() => handleNotificationClick(notif.id, notif.postId)}
                className='flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span
                    className={cn(
                      'line-clamp-1 text-xs font-semibold',
                      isRead ? 'text-muted-foreground font-normal' : 'text-foreground'
                    )}
                  >
                    {notif.title}
                  </span>
                  <span className='text-muted-foreground shrink-0 font-mono text-[10px]'>
                    {formatPostDate(notif.createdAt, { relative: true })}
                  </span>
                </div>
                <span className='text-muted-foreground line-clamp-2 text-xs'>
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
    <div className='border-border bg-card relative border shadow-xl'>
      <CornerBrackets />
      <div className='border-border bg-muted/40 flex items-center justify-between border-b px-3.5 py-2 font-mono'>
        <div className='flex items-center gap-2'>
          <span className='bg-success size-1.5 animate-pulse rounded-full' />
          <h2 className='text-foreground text-[11px] font-bold tracking-wider uppercase'>
            {'// DISPATCHES'}
          </h2>
        </div>
        {unread > 0 ? (
          <span className='border-border bg-foreground text-background border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider'>
            {unread} NEW
          </span>
        ) : (
          <span className='text-muted-foreground font-mono text-[10px] uppercase'>
            ALL CAUGHT UP
          </span>
        )}
      </div>
      <div className='divide-border max-h-72 divide-y overflow-y-auto overscroll-contain'>
        {notificationsList}
      </div>
      {notifications.length > 0 && (
        <div className='border-border bg-muted/30 flex items-center justify-between border-t p-2 font-mono text-[10px]'>
          <button
            type='button'
            onClick={handleClearAll}
            className='border-border bg-background text-muted-foreground hover:border-foreground hover:bg-muted hover:text-foreground flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 transition-colors'
          >
            <span>[MARK ALL AS READ]</span>
          </button>
          <span className='text-muted-foreground'>{notifications.length} TOTAL</span>
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
      {loading && <p className='text-muted-foreground p-4 text-center text-sm'>Loading...</p>}
      {!loading && results.length === 0 && (
        <p className='text-muted-foreground p-4 text-center text-sm'>No results found.</p>
      )}
      {!loading &&
        results.map((post) => (
          <HoverMark
            key={post.id}
            label='Read article'
            className='border-border border-b last:border-0'
          >
            <button
              type='button'
              className='block w-full px-4 py-3 text-left'
              onClick={() => handleSearchResultSelect(post.id)}
            >
              <p className='text-sm font-medium'>{post.title}</p>
              <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs'>
                {post.description}
              </p>
            </button>
          </HoverMark>
        ))}
    </>
  )

  const searchField = (
    <div className='relative'>
      <div className='border-border bg-background flex items-center gap-3 border px-3 py-2.5'>
        <Search className='text-muted-foreground size-4 shrink-0' />
        <input
          ref={searchRef}
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search posts...'
          aria-label='Search posts'
          className='placeholder:text-muted-foreground w-full bg-transparent text-base outline-none sm:text-sm'
          onFocus={() => search && setShowDropdown(true)}
        />
      </div>
      {showDropdown && (
        <div className='border-border bg-card absolute inset-x-0 z-50 mt-1 max-h-72 overflow-auto overscroll-contain border shadow-lg'>
          {searchResults}
        </div>
      )}
    </div>
  )

  return (
    <header
      className={cn(
        'border-border bg-card/90 sticky top-0 z-40 w-full border-b backdrop-blur-md transition-[border-color,box-shadow] duration-150',
        isScrolled && 'border-border-strong shadow-sm'
      )}
    >
      <div className='mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8'>
        {/* Left: Brand identity + system status */}
        <div className='flex min-w-0 items-center gap-3'>
          <Link href='/' className='group flex min-w-0 items-center gap-2.5'>
            <Image
              src='/logo.svg'
              alt='Logo'
              width={28}
              height={28}
              className='border-border bg-background size-7 shrink-0 border p-0.5 transition-transform duration-150 group-hover:scale-105'
            />
            <div className='flex min-w-0 items-baseline gap-2'>
              <span className='font-heading text-foreground truncate text-sm font-bold tracking-tight sm:text-base'>
                {SITE_NAME}
              </span>
              <span className='text-border hidden sm:inline' aria-hidden>
                /
              </span>
              <span className='text-muted-foreground hidden shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase sm:inline'>
                by Harshhaa
              </span>
            </div>
          </Link>

          <div className='border-border bg-muted/50 hidden items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase 2xl:flex'>
            <span className='relative flex size-1.5'>
              <span className='bg-success/60 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
              <span className='bg-success relative inline-flex size-1.5 rounded-full' />
            </span>
            <span className='text-foreground font-medium'>SYS:OK</span>
          </div>
        </div>

        {/* Center: Architectural bottom-bar navigation rail */}
        <nav className='hidden h-14 items-center gap-1 lg:flex' aria-label='Main Navigation'>
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex h-14 items-center px-3 font-mono text-[11px] tracking-wider uppercase transition-colors duration-150',
                  isActive
                    ? 'text-foreground after:bg-foreground font-semibold after:absolute after:inset-x-2 after:bottom-0 after:h-0.5'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Command search + utilities + session */}
        <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
          <button
            type='button'
            onClick={() => setIsCommandOpen(true)}
            className='border-border bg-background/80 text-muted-foreground hover:border-border-strong hover:text-foreground hidden h-8 cursor-pointer items-center gap-2 border px-2.5 text-xs transition-colors lg:flex'
            aria-label='Search articles and run commands (Cmd+K)'
            title='Quick Search (⌘K)'
          >
            <Search className='size-3.5' />
            <span className='hidden font-mono text-xs xl:inline'>Search...</span>
            <kbd className='border-border bg-muted text-foreground rounded-none border px-1.5 py-0.5 font-mono text-[10px] font-semibold'>
              ⌘K
            </kbd>
          </button>

          <div className='hidden items-center gap-1.5 md:flex'>
            <div className='relative'>
              <button
                ref={notificationButtonRef}
                type='button'
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  'text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground relative flex size-8 cursor-pointer items-center justify-center border transition-colors',
                  showNotifications
                    ? 'border-border-strong bg-muted text-foreground'
                    : 'border-border/70 bg-background/60'
                )}
                aria-label='Show notifications'
              >
                <Bell className='size-4' />
                {unread > 0 && (
                  <span className='bg-destructive absolute top-1.5 right-1.5 size-1.5 rounded-full' />
                )}
              </button>

              {showNotifications && (
                <div
                  ref={notificationsRef}
                  className='absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)]'
                >
                  {notificationsPanel}
                </div>
              )}
            </div>

            {user?.role === 'admin' && <NewPostButton />}
            <ThemeToggle variant='icon' />
          </div>

          {user?.role === 'admin' && (
            <div className='md:hidden'>
              <NewPostButton compact />
            </div>
          )}

          <button
            type='button'
            onClick={() => setIsCommandOpen(true)}
            className='border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 cursor-pointer items-center justify-center border transition-colors lg:hidden'
            aria-label='Open search command palette'
          >
            <Search className='size-4' />
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
            type='button'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center border transition-colors lg:hidden'
            aria-label='Toggle menu'
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className='size-4' /> : <MenuIcon className='size-4' />}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className='border-border hidden border-t md:block'>
          <div className='relative mx-auto max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8'>
            {searchField}
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className='border-border bg-card max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t lg:hidden'>
          <div className='mx-auto max-w-[90rem] space-y-5 px-4 py-5 sm:px-6'>
            <div>
              <p className='text-muted-foreground mb-2 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase'>
                Search
              </p>
              {searchField}
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.18em] uppercase'>
                Navigation
              </p>
              <div className='grid grid-cols-2 gap-2 font-mono text-xs'>
                {NAV_ITEMS.map((item) => {
                  const isActive = item.match(pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'hover-fill flex items-center justify-between border p-2.5 tracking-wider uppercase transition-colors',
                        isActive
                          ? 'border-foreground bg-foreground text-background font-semibold'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className='bg-background size-1.5 rounded-full' />}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.18em] uppercase'>
                  Notifications
                </p>
                {unread > 0 && (
                  <span className='border-border bg-muted border px-2 py-0.5 font-mono text-[10px] font-medium'>
                    {unread} new
                  </span>
                )}
              </div>
              <div className='border-border bg-background border'>
                <div className='max-h-48 overflow-y-auto overscroll-contain'>
                  {notificationsList}
                </div>
                {notifications.length > 0 && (
                  <div className='border-border border-t p-2'>
                    <button
                      type='button'
                      onClick={handleClearAll}
                      className='border-border text-muted-foreground hover:bg-muted hover:text-foreground w-full cursor-pointer border px-3 py-2 font-mono text-xs'
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.18em] uppercase'>
                Theme
              </p>
              <ThemeToggle className='flex w-full [&>button]:flex-1' />
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
