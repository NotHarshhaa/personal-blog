'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Adds click-to-copy-anchor behavior to all headings with IDs
 * inside the nearest `.prose` container.
 */
export const HeadingAnchors = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const heading = (e.target as HTMLElement).closest(
        '.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]'
      ) as HTMLElement | null

      if (!heading?.id) return

      const url = `${globalThis.location.origin}${globalThis.location.pathname}#${heading.id}`

      void globalThis.navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard', { duration: 2000 })

        // Update URL hash without scrolling
        globalThis.history.replaceState(null, '', `#${heading.id}`)
      })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}

export default HeadingAnchors
