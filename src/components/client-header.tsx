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

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 flex justify-center px-4 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div
        className={`flex h-auto w-full max-w-4xl flex-col rounded-2xl border bg-white/10 px-4 py-2 shadow-md backdrop-blur-md transition-all duration-300 ease-in-out sm:px-6 dark:bg-white/5 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className='flex w-full items-center justify-between gap-3 sm:gap-4'>
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

          <div className='flex items-center gap-3 sm:gap-4'>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='relative flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
                aria-label='Notifications'
              >
                <Bell className='h-5 w-5' />
                <span className='absolute top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                  3
                </span>
              </motion.button>
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
