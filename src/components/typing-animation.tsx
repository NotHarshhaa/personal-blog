'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type TypingAnimationProps = {
  words: readonly string[]
  className?: string
  /** Duration each word stays visible (ms) */
  displayDuration?: number
}

const TypingAnimation = ({
  words,
  className,
  displayDuration = 2800
}: TypingAnimationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, displayDuration)

    return () => clearInterval(interval)
  }, [words.length, displayDuration])

  return (
    <span className={className} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentIndex]}
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="inline-block"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
      <motion.span
        className="ml-0.5 inline-block h-[1.1em] w-[2px] bg-current align-text-bottom"
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
        aria-hidden
      />
    </span>
  )
}

export default TypingAnimation
