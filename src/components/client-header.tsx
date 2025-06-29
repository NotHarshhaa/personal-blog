'use client'

import type { Session } from 'next-auth'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

import Menu from './menu'
import NewPostButton from './new-post-button.lazy'
import ThemeToggle from './theme-toggle'

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
      title: 'New Post: Learn DevOps by Playing Games 🎮',
      description: 'Check out the latest post on gamified DevOps learning!',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      postId: 'def456',
      title: 'Post Updated: End-to-End DevOps with Azure',
      description: 'The Azure CI/CD guide has been updated with new tips.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '3',
      postId: 'ghi789',
      title: 'New Post: Streamline Your CI/CD with AWS CodePipeline',
      description: 'Learn how to automate your CI/CD workflow with AWS.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ])
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
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
  }, [search])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  // Update the click outside handler for notifications
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

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  // Add these new functions to handle notifications
  const handleToggleRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notifId
          ? { ...n, read: !n.read }
          : n
      )
    )
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notifId: string, postId: string) => {
    handleToggleRead(notifId)
    router.push(`/posts/${postId}`)
    setShowNotifications(false)
  }

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 flex justify-center px-2 sm:px-4 transition-all duration-300 motion-reduce:transform-none ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div
        className={`w-full max-w-6xl mx-auto rounded-2xl border border-border/40 bg-white/80 dark:bg-zinc-900/80 shadow-lg px-2 py-2 sm:px-6 backdrop-blur-md transition-all duration-300 ease-in-out motion-safe:md:hover:shadow-xl motion-safe:md:hover:bg-white/90 dark:motion-safe:md:hover:bg-zinc-900/90 ${
          isScrolled ? 'shadow-xl' : ''
        }`}
      >
        <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
          <Link
            href='/'
            className='group flex items-center gap-2 text-base font-semibold transition-all duration-300 hover:opacity-90 sm:text-xl motion-safe:md:hover:-translate-y-0.5 motion-reduce:transform-none'
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="motion-reduce:transform-none"
            >
              <Image
                src='/logo.svg'
                alt='Logo'
                width={32}
                height={32}
                className='shrink-0 rounded-full transition-transform group-hover:scale-110'
              />
            </motion.div>
            <span className='font-medium text-wrap break-words whitespace-normal sm:text-base'>
              Harshhaa&apos;s DevOps & Cloud Space
            </span>
          </Link>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className='rounded-lg p-2 transition-all duration-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 motion-safe:md:hover:scale-105 motion-reduce:transform-none'
              aria-label='Toggle search'
            >
              <Search className='h-5 w-5' />
            </button>

            {user && (
              <div className='relative'>
                <button
                  ref={notificationButtonRef}
                  type='button'
                  onClick={() => setShowNotifications(!showNotifications)}
                  className='relative rounded-lg p-2 transition-all duration-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 motion-safe:md:hover:scale-105 motion-reduce:transform-none'
                  aria-label='Show notifications'
                >
                  <Bell className='h-5 w-5' />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className='absolute top-1 right-1 size-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900' />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      ref={notificationsRef}
                      initial={{ opacity: 0, scale: 0.95, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className='absolute right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border/40 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-zinc-900/95 dark:shadow-2xl'
                    >
                      <div className='flex items-center justify-between border-b border-border/10 px-4 py-3'>
                        <h2 className='text-base font-semibold'>Notifications</h2>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                            {notifications.filter(n => !n.read).length} new
                          </span>
                        )}
                      </div>

                      <div className='max-h-[calc(100vh-16rem)] overflow-y-auto overscroll-contain'>
                        {notifications.length === 0 ? (
                          <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
                            <div className='rounded-full bg-muted/30 p-3'>
                              <Bell className='h-6 w-6 text-muted-foreground' />
                            </div>
                            <p className='text-sm font-medium'>No notifications yet</p>
                            <p className='text-xs text-muted-foreground'>
                              We'll notify you when something important happens
                            </p>
                          </div>
                        ) : (
                          <div className='divide-y divide-border/5'>
                            {notifications.map((notif) => (
                              <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={() => handleNotificationClick(notif.id, notif.postId)}
                                className={cn(
                                  'group relative flex cursor-pointer flex-col gap-1 px-4 py-3 transition-colors',
                                  'hover:bg-muted/30',
                                  !notif.read && 'bg-blue-50/50 dark:bg-blue-900/10',
                                  !notif.read && 'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-500 dark:before:bg-blue-400'
                                )}
                              >
                                <div className='flex items-start justify-between gap-2'>
                                  <span className='line-clamp-2 flex-1 font-medium leading-tight'>
                                    {notif.title}
                                  </span>
                                  {!notif.read && (
                                    <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400' />
                                  )}
                                </div>
                                <p className='line-clamp-2 text-sm text-muted-foreground'>
                                  {notif.description}
                                </p>
                                <div className='flex items-center justify-between'>
                                  <time className='text-[10px] tabular-nums text-muted-foreground'>
                                    {new Date(notif.createdAt).toLocaleString()}
                                  </time>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                      e.stopPropagation() // Prevent triggering the parent onClick
                                      handleToggleRead(notif.id)
                                    }}
                                    className='invisible rounded-md bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground opacity-0 transition-all group-hover:visible group-hover:opacity-100'
                                  >
                                    Mark as {notif.read ? 'unread' : 'read'}
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className='border-t border-border/10 p-2'>
                          <button
                            type='button'
                            onClick={handleClearAll}
                            className='w-full rounded-md bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50'
                          >
                            Clear all notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user?.role === 'admin' && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="motion-reduce:transform-none"
              >
                <NewPostButton />
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center motion-reduce:transform-none'
            >
              <ThemeToggle />
            </motion.div>

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

        {/* Search Bar - now overlays below the header row */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='relative w-full overflow-visible motion-reduce:transform-none'
            >
              <div className='mt-2 flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800 transition-all duration-300 motion-safe:md:hover:bg-gray-200 dark:motion-safe:md:hover:bg-gray-700'>
                <Search className='h-4 w-4 text-gray-500' />
                <input
                  ref={searchRef}
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search posts, tags, or categories...'
                  className='w-full bg-transparent outline-none placeholder:text-sm'
                  onFocus={() => search && setShowDropdown(true)}
                />
              </div>
              {/* Results Dropdown */}
              {showDropdown && (
                <div className='absolute right-0 left-0 z-50 mt-1 max-h-72 overflow-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900'>
                  {loading && (
                    <div className='p-4 text-center text-sm text-gray-500'>Loading...</div>
                  )}
                  {!loading && results.length === 0 && (
                    <div className='p-4 text-center text-sm text-gray-500'>No results found.</div>
                  )}
                  {!loading &&
                    results.length > 0 &&
                    results.map((post) => (
                      <button
                        key={post.id}
                        type='button'
                        className='block w-full px-4 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
                        onMouseDown={() => {
                          console.log('Navigating to', `/posts/${post.id}`)
                          setIsSearchOpen(false)
                          setShowDropdown(false)
                          setSearch('')
                          setTimeout(() => {
                            router.push(`/posts/${post.id}`)
                          }, 50)
                        }}
                      >
                        <div className='font-medium'>{post.title}</div>
                        <div className='line-clamp-2 text-xs text-gray-500'>{post.description}</div>
                      </button>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default ClientHeader
