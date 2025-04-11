'use client'

import { Button } from '@tszhong0411/ui'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      aria-label='Toggle theme'
      className='relative'
    >
      <AnimatePresence mode='wait' initial={false}>
        {resolvedTheme === 'dark' ? (
          <motion.span
            key='moon'
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className='absolute inset-0 flex items-center justify-center'
          >
            <MoonIcon className='size-5' />
          </motion.span>
        ) : (
          <motion.span
            key='sun'
            initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className='absolute inset-0 flex items-center justify-center'
          >
            <SunIcon className='size-5' />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}

export default ThemeToggle
