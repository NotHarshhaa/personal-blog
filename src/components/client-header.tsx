'use client'

import type { Session } from 'next-auth'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
  const unreadCount = notifications.filter((n) => !n.read).length
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const notifBtn = document.getElementById('notif-bell-btn')
      const notifDropdown = document.getElementById('notif-dropdown')
      if (
        notifBtn && notifDropdown &&
        !notifBtn.contains(e.target as Node) &&
        !notifDropdown.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClick)
      // Mark all notifications as read when dropdown is opened
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNotifications])

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 flex justify-center px-2 sm:px-4 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div
        className={`w-full max-w-6xl mx-auto rounded-2xl border border-border/40 bg-white/80 dark:bg-zinc-900/80 shadow-lg px-2 py-2 sm:px-6 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isScrolled ? 'shadow-xl' : ''
        }`}
      >
        <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
          <Link
            href='/'
            className='group flex items-center gap-2 text-base font-semibold transition hover:opacity-90 sm:text-xl'
          >
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
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

          <div className='flex flex-wrap items-center justify-end gap-2 sm:gap-4 min-w-0'>
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsSearchOpen(!isSearchOpen)
                setTimeout(() => searchRef.current?.focus(), 100)
              }}
              className='flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
              aria-label='Search'
            >
              <Search className='h-5 w-5' />
            </motion.button>

            {/* Notifications */}
            {user && (
              <div className='relative'>
                <motion.button
                  id='notif-bell-btn'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='relative flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
                  aria-label='Notifications'
                  onClick={() => setShowNotifications((v) => !v)}
                >
                  <Bell className='h-5 w-5' />
                  {unreadCount > 0 && (
                    <span className='absolute top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                      {unreadCount}
                    </span>
                  )}
                </motion.button>
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div
                    id='notif-dropdown'
                    className='absolute right-0 z-50 mt-2 w-80 max-w-xs rounded-lg border bg-white shadow-lg dark:bg-gray-900'
                  >
                    <div className='p-4 border-b text-base font-semibold'>Notifications</div>
                    <div className='max-h-72 overflow-auto'>
                      {notifications.length === 0 && (
                        <div className='p-4 text-center text-sm text-gray-500'>No notifications.</div>
                      )}
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 ${
                            notif.read
                              ? 'bg-transparent'
                              : 'bg-gray-50 dark:bg-gray-800/60 border-l-4 border-primary'
                          }`}
                        >
                          <div className='font-medium'>{notif.title}</div>
                          <div className='text-xs text-gray-500'>{notif.description}</div>
                          <div className='text-[10px] text-gray-400 mt-1'>
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user?.role === 'admin' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NewPostButton />
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center'
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
              className='relative w-full overflow-visible'
            >
              <div className='mt-2 flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800'>
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
