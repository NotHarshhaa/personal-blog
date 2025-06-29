'use client'

import { SiGithub, SiInstagram, SiTelegram, SiX } from '@icons-pack/react-simple-icons'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@tszhong0411/ui'

type Links = Array<{
  href: string
  icon: React.ReactNode
  label: string
}>

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const links: Links = [
    {
      href: 'https://t.me/NotHarshhaa',
      icon: <SiTelegram className="size-5" />,
      label: 'Telegram'
    },
    {
      href: 'https://github.com/NotHarshhaa',
      icon: <SiGithub className="size-5" />,
      label: 'GitHub'
    },
    {
      href: 'https://www.instagram.com/harshhaareddy/',
      icon: <SiInstagram className="size-5" />,
      label: 'Instagram'
    },
    {
      href: 'https://x.com/your-handle',
      icon: <SiX className="size-5" />,
      label: 'X'
    }
  ]

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className='w-full pt-12 motion-reduce:transform-none'
    >
      <div className='w-full border-t border-border/30 mb-0' />
      <div className='mx-auto w-full max-w-6xl px-4 md:px-8'>
        <div className='rounded-2xl border border-border/40 bg-white/80 dark:bg-zinc-900/80 shadow-lg px-6 py-8 mt-6 mb-4 backdrop-blur-md transition-all duration-300 motion-safe:hover:shadow-xl motion-safe:hover:scale-[1.01] motion-safe:md:transform motion-reduce:transform-none'>
          <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-8'>
            {/* About Section */}
            <div className='flex-1 min-w-[180px] transition-all duration-300 motion-safe:md:hover:translate-x-2 motion-reduce:transform-none'>
              <h3 className='text-lg font-semibold mb-2'>About</h3>
              <p className='text-sm text-muted-foreground'>
                A passionate developer sharing thoughts, experiences, and insights about technology and life.
              </p>
            </div>

            {/* Newsletter + Social Section (stacked on mobile, row on desktop) */}
            <div className='flex-1 flex flex-col gap-6'>
              {/* Newsletter Section */}
              <div className='transition-all duration-300 motion-safe:md:hover:-translate-y-1 motion-reduce:transform-none'>
                <h3 className='text-lg font-semibold mb-2'>Stay Updated</h3>
                <form onSubmit={handleSubscribe} className='flex gap-2 items-center flex-nowrap'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email'
                    className='min-w-[160px] flex-1 rounded-lg border border-border/40 bg-white/60 dark:bg-zinc-800/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition'
                    required
                  />
                  <Button type='submit' variant='default' className='h-9 px-4 whitespace-nowrap flex-shrink-0'>
                    Subscribe
                  </Button>
                </form>
                {isSubscribed && (
                  <p className='text-xs text-green-500 mt-1'>Thanks for subscribing!</p>
                )}
              </div>

              {/* Social Links Section */}
              <div className='transition-all duration-300 motion-safe:md:hover:-translate-y-1 motion-reduce:transform-none'>
                <h3 className='text-lg font-semibold mb-2'>Connect</h3>
                <div className='flex flex-row flex-wrap gap-4 items-center'>
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300 hover:bg-white/30 dark:hover:bg-zinc-800/40 motion-safe:md:hover:scale-105 motion-reduce:transform-none'
                      title={link.label}
                    >
                      {link.icon}
                      <span className='hidden md:inline'>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground'>
            <p>© {new Date().getFullYear()} H A R S H H A A. All rights reserved.</p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
