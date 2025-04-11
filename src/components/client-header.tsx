'use client'

import type { Session } from 'next-auth'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import Menu from './menu'
import NewPostButton from './new-post-button.lazy'
import ThemeToggle from './theme-toggle'

type Props = {
  user: Session['user'] | null
}

const ClientHeader = ({ user }: Props) => {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className='fixed inset-x-0 top-4 z-50 flex justify-center px-4'
    >
      <div className='flex h-auto w-full max-w-4xl flex-col gap-3 rounded-2xl border bg-white/10 px-4 py-2 shadow-md backdrop-blur-md transition-all duration-300 ease-in-out sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:bg-white/5'>
        <div className='flex w-full items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 text-base font-semibold transition hover:opacity-90 sm:text-xl'
          >
            <Image
              src='/logo.svg'
              alt='Logo'
              width={28}
              height={28}
              className='shrink-0 rounded-full'
            />
            <span className='text-sm text-wrap break-words whitespace-normal sm:text-base'>
              Harshhaa&apos;s DevOps & Cloud Space
            </span>
          </Link>

          <div className='flex items-center gap-2 sm:gap-4'>
            {user?.role === 'admin' && <NewPostButton />}
            <ThemeToggle />
            <Menu user={user} />
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default ClientHeader
