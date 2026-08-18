'use client'

import type { Session } from 'next-auth'

import { Bell, Menu as MenuIcon, Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SITE_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

import Menu from './menu'
import NewPostButton from './new-post-button.lazy'
import ThemeToggle from './theme-toggle'
import { HoverMark } from './hover-mark'

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
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      postId: 'abc123',
      title: 'New Post: Learn DevOps by Playing Games',
      description: 'Check out the latest post on gamified DevOps and platform learning!',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      postId: 'def456',
      title: 'Post Updated: End-to-End DevOps with Azure',
      description: 'The Azure CI/CD guide has been updated with new tips.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    }
  ])
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let ticking = false
    let lastScrolled = false

    const updateScrolled = () => {
      const next = window.scrollY > 8
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

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScrolled()
    return () => window.removeEventListener('scroll', handleScroll)
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
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: !n.read } : n))
    )
  }

  const handleClearAll = () => setNotifications([])

  const handleNotificationClick = (notifId: string, postId: string) => {
    handleToggleRead(notifId)
    router.push(`/posts/${postId}`)
    setShowNotifications(false)
    setIsMobileMenuOpen(false)
  }

  const unread = notifications.filter((n) => !n.read).length

  const notificationsList = (
    <>
      {notifications.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          No notifications yet
        </p>
      ) : (
        notifications.map((notif) => (
          <HoverMark
            key={notif.id}
            label="Open"
            className={cn(
              'border-b border-border last:border-0',
              !notif.read && 'bg-muted/20'
            )}
          >
            <button
              type="button"
              onClick={() => handleNotificationClick(notif.id, notif.postId)}
              className="flex w-full flex-col gap-1 px-4 py-3 text-left"
            >
              <span className="line-clamp-2 text-sm font-medium">{notif.title}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">
                {notif.description}
              </span>
            </button>
          </HoverMark>
        ))
      )}
    </>
  )

  const notificationsPanel = (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Notifications</h2>
        {unread > 0 && (
          <span className="border border-border px-2 py-0.5 text-[10px] font-medium">
            {unread} new
          </span>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">{notificationsList}</div>
      {notifications.length > 0 && (
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Clear all
          </button>
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
        'relative isolate sticky top-0 z-50 border-b border-border border-t border-t-card bg-card',
        'before:pointer-events-none before:absolute before:inset-x-0 before:-top-px before:z-10 before:h-px before:bg-card',
        'max-md:after:pointer-events-none max-md:after:absolute max-md:after:inset-x-0 max-md:after:bottom-full max-md:after:-z-10 max-md:after:h-screen max-md:after:bg-card',
        'supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="mx-auto flex min-h-14 max-w-[90rem] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 pr-2 sm:flex-none sm:pr-0"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="size-7 shrink-0 border border-border transition-transform group-hover:scale-105"
          />
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-bold tracking-tight sm:text-sm">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                {SITE_NAME}
              </span>
            </p>
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase sm:text-[10px] sm:tracking-[0.16em]">
              by Harshhaa
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1.5 sm:gap-2 md:flex">
            <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex size-9 items-center justify-center border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
          >
            {isSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </button>

          {user && (
            <div className="relative">
              <button
                ref={notificationButtonRef}
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex size-9 items-center justify-center border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
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
          )}

          {user?.role === 'admin' && <NewPostButton />}
          <ThemeToggle />
          </div>

          {user?.role === 'admin' && (
            <div className="md:hidden">
              <NewPostButton compact />
            </div>
          )}

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
            className="flex size-9 items-center justify-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
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

                {user && (
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
                            className="w-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
    </header>
  )
}

export default ClientHeader
