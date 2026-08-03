'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/utils'
import { List } from 'lucide-react'
import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'

type Heading = {
  id: string
  text: string
  level: number
}

type TableOfContentsProps = {
  content: string
  className?: string
}

const TableOfContents = ({ content, className }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const extractHeadings = () => {
      const contentElement = document.querySelector('.prose')
      if (!contentElement) {
        setTimeout(extractHeadings, 100)
        return
      }

      const headingElements = contentElement.querySelectorAll(
        'h1, h2, h3, h4, h5, h6'
      )

      const extractedHeadings: Heading[] = []
      headingElements.forEach((heading) => {
        const text = heading.textContent || ''
        if (!text.trim()) return

        const level = parseInt(heading.tagName.charAt(1))
        let id = heading.id

        if (!id) {
          id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50)

          let uniqueId = id
          let counter = 1
          while (document.getElementById(uniqueId)) {
            uniqueId = `${id}-${counter}`
            counter++
          }
          id = uniqueId
          heading.id = id
        }

        extractedHeadings.push({ id, text, level })
      })

      setHeadings(extractedHeadings)
    }

    extractHeadings()

    const observer = new MutationObserver(extractHeadings)
    const contentElement = document.querySelector('.prose')
    if (contentElement) {
      observer.observe(contentElement, { childList: true, subtree: true })
    }

    return () => observer.disconnect()
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      setIsMobileOpen(false)
    }
  }

  if (headings.length === 0) return null

  const tocContent = (
    <nav className="max-h-[60vh] space-y-0.5 overflow-y-auto">
      {headings.map((heading) => (
        <HoverMark key={heading.id} label="Jump" className="py-0.5">
          <a
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className={cn(
              'block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground',
              heading.level === 1 && 'pl-0 font-semibold',
              heading.level === 2 && 'pl-3',
              heading.level === 3 && 'pl-6 text-xs',
              heading.level >= 4 && 'pl-9 text-xs',
              activeId === heading.id && 'font-medium text-foreground underline'
            )}
          >
            {heading.text}
          </a>
        </HoverMark>
      ))}
    </nav>
  )

  return (
    <>
      <aside className={cn('sticky top-24 hidden w-56 shrink-0 lg:block', className)}>
        <Frame>
          <FrameHeader label="On this page" />
          <FrameBody className="py-4">{tocContent}</FrameBody>
        </Frame>
      </aside>

      <div className="fixed right-6 bottom-6 z-40 lg:hidden">
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="size-12 border border-border bg-primary text-primary-foreground"
              aria-label="Open Table of Contents"
            >
              <List className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-[90vw] border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase">
                <List className="size-4" />
                On this page
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">{tocContent}</div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default TableOfContents
