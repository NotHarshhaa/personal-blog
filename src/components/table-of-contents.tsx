'use client'

import { ArrowUp, List } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CornerBrackets, Frame, FrameBody } from '@/components/frame'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui'
import { cn } from '@/utils'

type Heading = {
  id: string
  text: string
  level: number
}

type TableOfContentsProps = {
  content: string
  className?: string
}

export const TableOfContents = ({ content, className }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const extractHeadings = () => {
      const contentElement = document.querySelector('.prose')
      if (!contentElement) {
        retryTimer = setTimeout(extractHeadings, 100)
        return
      }

      const headingElements = contentElement.querySelectorAll('h2, h3, h4')

      const extractedHeadings: Heading[] = []
      for (const heading of headingElements) {
        const text = heading.textContent || ''
        if (!text.trim()) continue

        const level = Number.parseInt(heading.tagName.charAt(1))
        let id = heading.id

        if (!id) {
          id = text
            .toLowerCase()
            .replaceAll(/[^a-z0-9]+/g, '-')
            .replaceAll(/^-|-$/g, '')
            .slice(0, 50)

          let uniqueId = id
          let counter = 1
          // CSS.escape keeps selector parsing valid for ids that start with
          // a digit (e.g. headings like "1. Weight Compression")
          while (document.querySelector(`#${CSS.escape(uniqueId)}`)) {
            uniqueId = `${id}-${counter}`
            counter++
          }
          id = uniqueId
          heading.id = id
        }

        extractedHeadings.push({ id, text: text.trim(), level })
      }

      setHeadings(extractedHeadings)
      if (extractedHeadings.length > 0 && !activeId && extractedHeadings[0]?.id) {
        setActiveId(extractedHeadings[0].id)
      }
    }

    extractHeadings()

    const observer = new MutationObserver(extractHeadings)
    const contentElement = document.querySelector('.prose')
    if (contentElement) {
      observer.observe(contentElement, { childList: true, subtree: true })
    }

    return () => {
      observer.disconnect()
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [content, activeId])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        rootMargin: '-15% 0% -65% 0%',
        threshold: 0
      }
    )

    for (const heading of headings) {
      const element = document.querySelector(`#${CSS.escape(heading.id)}`)
      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      for (const heading of headings) {
        const element = document.querySelector(`#${CSS.escape(heading.id)}`)
        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.querySelector(`#${CSS.escape(id)}`)
    if (element) {
      const offset = 90
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      setActiveId(id)
      setIsMobileOpen(false)
    }
  }

  const activeIndex = useMemo(() => {
    const idx = headings.findIndex((h) => h.id === activeId)
    return idx === -1 ? 1 : idx + 1
  }, [headings, activeId])

  // Keep the active entry visible while scrolling long articles
  const activeItemRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  if (headings.length === 0) return null

  const renderTocItems = (isMobile = false) => (
    <div className='relative'>
      <nav
        className={cn(
          'space-y-1 overflow-y-auto pr-1',
          isMobile ? 'max-h-[65vh]' : 'max-h-[calc(100vh-14rem)]'
        )}
        aria-label='Table of contents'
      >
        <div className='border-border/80 relative space-y-1 border-l pl-2.5'>
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id
            const isSubheading = heading.level > 2

            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                ref={isActive ? activeItemRef : undefined}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  'group relative flex items-start py-1 text-xs leading-snug transition-all duration-150',
                  isSubheading ? 'pl-2 text-[11px]' : 'pl-0',
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground/80 hover:text-foreground hover:translate-x-0.5'
                )}
              >
                {/* Active Indicator Bar on Left Border */}
                {isActive && (
                  <span
                    aria-hidden
                    className='bg-foreground absolute top-1.5 -left-[11px] h-3.5 w-0.5 transition-all duration-150'
                  />
                )}

                <span className='flex min-w-0 flex-1 items-start gap-1.5'>
                  {isSubheading ? (
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 shrink-0 font-mono text-[9px]',
                        isActive ? 'text-foreground' : 'text-muted-foreground/40'
                      )}
                    >
                      ↳
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 shrink-0 font-mono text-[10px] tracking-tight',
                        isActive ? 'text-foreground font-bold' : 'text-muted-foreground/50'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                  )}
                  <span className='line-clamp-2 break-words'>{heading.text}</span>
                </span>
              </a>
            )
          })}
        </div>
      </nav>

      {/* Quick Jump to Top */}
      <button
        type='button'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className='border-border text-muted-foreground hover:border-foreground hover:text-foreground mt-3.5 flex w-full cursor-pointer items-center justify-between border-t pt-2.5 font-mono text-[10px] tracking-wider uppercase transition-colors'
        aria-label='Scroll to top of article'
      >
        <span className='inline-flex items-center gap-1.5'>
          <ArrowUp className='size-3' />
          <span>Top of page</span>
        </span>
        <span className='text-muted-foreground/60 text-[9px]'>[{headings.length} items]</span>
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop Sticky Blueprint Sidebar */}
      <aside className={cn('sticky top-24 hidden w-64 shrink-0 lg:block', className)}>
        <Frame>
          {/* Compact mono header: fits the 256px sidebar without wrapping */}
          <div className='border-border flex items-center justify-between gap-2 border-b px-3.5 py-2.5 sm:px-4'>
            <span className='text-foreground inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase'>
              <List className='size-3' aria-hidden />
              Contents
            </span>
            <span className='text-muted-foreground font-mono text-[10px] tabular-nums'>
              [{String(activeIndex).padStart(2, '0')}/{String(headings.length).padStart(2, '0')}]
            </span>
          </div>

          {/* Reading progress through the sections */}
          <div aria-hidden className='bg-border/60 h-0.5 w-full'>
            <div
              className='bg-foreground h-full transition-all duration-300'
              style={{ width: `${Math.round((activeIndex / headings.length) * 100)}%` }}
            />
          </div>

          <FrameBody className='p-3 sm:p-4'>{renderTocItems(false)}</FrameBody>
        </Frame>
      </aside>

      {/* Mobile Floating Blueprint Button & Drawer */}
      <div className='fixed right-5 bottom-6 z-40 lg:hidden'>
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button
              className='border-border bg-card text-foreground hover:border-foreground hover:bg-foreground hover:text-background relative size-11 cursor-pointer rounded-none border shadow-lg transition-all active:translate-y-px'
              aria-label='Open Table of Contents'
            >
              <CornerBrackets className='size-2' />
              <List className='size-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='border-border bg-card max-h-[85vh] max-w-[92vw] rounded-none border p-0 shadow-2xl sm:max-w-md'>
            <CornerBrackets />
            <div className='border-border bg-muted/40 border-b px-4 py-3 pr-12'>
              <DialogHeader className='p-0'>
                <DialogTitle className='text-foreground flex items-center justify-between font-mono text-xs font-semibold tracking-wider uppercase'>
                  <span className='flex items-center gap-2'>
                    <List className='size-3.5' />
                    Contents
                  </span>
                  <span className='text-muted-foreground text-[10px]'>
                    [{String(activeIndex).padStart(2, '0')}/
                    {String(headings.length).padStart(2, '0')}]
                  </span>
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className='p-4'>{renderTocItems(true)}</div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default TableOfContents
