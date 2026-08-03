'use client'

import { Button } from '@/components/ui'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!isVisible) return null

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      size="icon"
      variant="outline"
      className="fixed right-4 bottom-4 z-40 size-10 border-border bg-card sm:right-6 sm:bottom-6"
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-4" />
    </Button>
  )
}

export default ScrollToTop
