'use client'

import { SiGithub, SiInstagram, SiTelegram } from '@icons-pack/react-simple-icons'
import { motion } from 'framer-motion'

type Links = Array<{
  href: string
  icon: React.ReactNode
}>

const Footer = () => {
  const links: Links = [
    {
      href: 'https://t.me/NotHarshhaa',
      icon: <SiTelegram className='size-4' />
    },
    {
      href: 'https://github.com/NotHarshhaa',
      icon: <SiGithub className='size-4' />
    },
    {
      href: 'https://www.instagram.com/harshhaareddy/',
      icon: <SiInstagram className='size-4' />
    }
  ]

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className='fixed inset-x-0 bottom-4 z-40 flex justify-center px-4'
    >
      <div className='border-border/40 text-foreground h-footer flex w-full max-w-4xl items-center justify-between rounded-2xl border bg-white/10 px-6 shadow-md backdrop-blur-md transition-all duration-300 ease-in-out dark:bg-white/5'>
        <p className='text-sm'>© {new Date().getFullYear()} H A R S H H A A</p>

        <div className='flex items-center gap-4'>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
              className='transition-opacity hover:opacity-80'
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
