'use client'

import { Button } from '@/components/ui'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const isVisibleRef = useRef(false)

  useEffect(() => {
    let ticking = false

    const toggleVisibility = () => {
      const next = window.scrollY > 400
      if (next !== isVisibleRef.current) {
        isVisibleRef.current = next
        setIsVisible(next)
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(toggleVisibility)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    toggleVisibility()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!isVisible) return null

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      size="icon"
      variant="outline"
      className="fixed right-4 bottom-20 z-40 size-10 border-border bg-card sm:right-6 sm:bottom-6"
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-4" />
    </Button>
  )
}

export default ScrollToTop
