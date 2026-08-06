'use client'

import type { Session } from 'next-auth'

import { Bell, Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
      description: 'Check out the latest post on gamified DevOps learning!',
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
    if (!isSearchOpen) {
      setSearch('')
      setResults([])
      setShowDropdown(false)
    }
  }, [isSearchOpen])

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
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-card',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="size-7 shrink-0 border border-border"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-wide">
              DevOps & Cloud Space
            </p>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              by Harshhaa
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
                  className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-border bg-card"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold">Notifications</h2>
                    {unread > 0 && (
                      <span className="border border-border px-2 py-0.5 text-[10px] font-medium">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
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
                            onClick={() =>
                              handleNotificationClick(notif.id, notif.postId)
                            }
                            className="flex w-full flex-col gap-1 px-4 py-3 text-left"
                          >
                            <span className="line-clamp-2 text-sm font-medium">
                              {notif.title}
                            </span>
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                              {notif.description}
                            </span>
                          </button>
                        </HoverMark>
                      ))
                    )}
                  </div>
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
              )}
            </div>
          )}

          {user?.role === 'admin' && <NewPostButton />}
          <ThemeToggle />
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
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-border">
          <div className="relative mx-auto max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8">
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
                autoFocus
              />
            </div>
            {showDropdown && (
              <div className="absolute inset-x-4 z-50 mt-1 max-h-72 overflow-auto border border-border bg-card sm:inset-x-6">
                {loading && (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </p>
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
                        onMouseDown={() => {
                          setIsSearchOpen(false)
                          setShowDropdown(false)
                          setSearch('')
                          router.push(`/posts/${post.id}`)
                        }}
                      >
                        <p className="text-sm font-medium">{post.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {post.description}
                        </p>
                      </button>
                    </HoverMark>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default ClientHeader
