'use client'

import { SiGithub, SiInstagram, SiTelegram, SiX } from '@icons-pack/react-simple-icons'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui'

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
      {/* Decorative divider */}
      <div className='w-full mb-8 flex items-center gap-4'>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
        <div className="rounded-full bg-border/50 p-1.5">
          <div className="size-2 rounded-full bg-primary/50" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
      </div>
      
      <div className='mx-auto w-full max-w-6xl px-4 md:px-8'>
        <div className='rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-lg px-5 py-6 sm:px-8 sm:py-10 mb-4 backdrop-blur-md transition-all duration-300 motion-safe:hover:shadow-xl motion-safe:hover:shadow-primary/5 dark:motion-safe:hover:shadow-primary/10 relative overflow-hidden'>
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl opacity-50" />
          
          <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-8 relative z-10'>
            {/* About Section */}
            <div className='flex-1 min-w-[180px] transition-all duration-300 motion-safe:md:hover:translate-x-2 motion-reduce:transform-none'>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                <h3 className='text-lg font-bold'>About</h3>
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                A passionate developer sharing thoughts, experiences, and insights about DevOps, Cloud computing, and technology.
              </p>
            </div>

            {/* Newsletter + Social Section (stacked on mobile, row on desktop) */}
            <div className='flex-1 flex flex-col gap-6'>
              {/* Newsletter Section */}
              <div className='transition-all duration-300 motion-safe:md:hover:-translate-y-1 motion-reduce:transform-none'>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                  <h3 className='text-lg font-bold'>Stay Updated</h3>
                </div>
                <form onSubmit={handleSubscribe} className='flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email'
                    className='min-w-0 flex-1 rounded-xl border border-border/40 bg-white/80 dark:bg-zinc-800/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 shadow-sm'
                    required
                  />
                  <Button type='submit' variant='default' className='h-12 sm:h-10 px-6 whitespace-nowrap flex-shrink-0 font-medium shadow-sm hover:shadow-md'>
                    Subscribe
                  </Button>
                </form>
                {isSubscribed && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1.5'
                  >
                    <span className="size-1.5 rounded-full bg-green-500" />
                    Thanks for subscribing!
                  </motion.p>
                )}
              </div>

              {/* Social Links Section */}
              <div className='transition-all duration-300 motion-safe:md:hover:-translate-y-1 motion-reduce:transform-none'>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                  <h3 className='text-lg font-bold'>Connect</h3>
                </div>
                <div className='flex flex-row flex-wrap gap-3 items-center'>
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/20 motion-safe:md:hover:scale-105 motion-reduce:transform-none shadow-sm hover:shadow-md'
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
          
          {/* Copyright */}
          <div className='mt-10 pt-6 border-t border-border/40 text-center'>
            <p className='text-xs text-muted-foreground'>
              © {new Date().getFullYear()} <span className="font-semibold text-foreground">H A R S H H A A</span>. All rights reserved.
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Sharing DevOps & Cloud knowledge with the community 🌐
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
