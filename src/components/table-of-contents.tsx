'use client'

import { ArrowUp, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { CornerBrackets, Frame, FrameBody, FrameHeader } from '@/components/frame'
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
    const extractHeadings = () => {
      const contentElement = document.querySelector('.prose')
      if (!contentElement) {
        setTimeout(extractHeadings, 100)
        return
      }

      const headingElements = contentElement.querySelectorAll(
        'h2, h3, h4'
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

        extractedHeadings.push({ id, text: text.trim(), level })
      })

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

    return () => observer.disconnect()
  }, [content, activeId])

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
        rootMargin: '-15% 0% -65% 0%',
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
    return idx >= 0 ? idx + 1 : 1
  }, [headings, activeId])

  if (headings.length === 0) return null

  const renderTocItems = (isMobile = false) => (
    <div className="relative">
      <nav
        className={cn(
          'space-y-1 overflow-y-auto pr-1',
          isMobile ? 'max-h-[65vh]' : 'max-h-[calc(100vh-14rem)]'
        )}
        aria-label="Table of contents"
      >
        <div className="relative border-l border-border/80 pl-2.5 space-y-1">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id
            const isSubheading = heading.level > 2

            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  'group relative flex items-start py-1 text-xs leading-snug transition-all duration-150',
                  isSubheading ? 'pl-2 text-[11px]' : 'pl-0',
                  isActive
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground/80 hover:text-foreground hover:translate-x-0.5'
                )}
              >
                {/* Active Indicator Bar on Left Border */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -left-[11px] top-1.5 h-3.5 w-0.5 bg-foreground transition-all duration-150"
                  />
                )}

                <span className="flex items-start gap-1.5 min-w-0 flex-1">
                  {isSubheading ? (
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 font-mono text-[9px] shrink-0',
                        isActive ? 'text-foreground' : 'text-muted-foreground/40'
                      )}
                    >
                      ↳
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 font-mono text-[10px] shrink-0 tracking-tight',
                        isActive ? 'text-foreground font-bold' : 'text-muted-foreground/50'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                  )}
                  <span className="break-words line-clamp-2">{heading.text}</span>
                </span>
              </a>
            )
          })}
        </div>
      </nav>

      {/* Quick Jump to Top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-3.5 flex w-full items-center justify-between border-t border-border pt-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer"
        aria-label="Scroll to top of article"
      >
        <span className="inline-flex items-center gap-1.5">
          <ArrowUp className="size-3" />
          <span>Top of page</span>
        </span>
        <span className="text-[9px] text-muted-foreground/60">
          [{headings.length} items]
        </span>
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop Sticky Blueprint Sidebar */}
      <aside className={cn('sticky top-24 hidden w-64 shrink-0 lg:block', className)}>
        <Frame>
          <FrameHeader label="Table of Contents">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span>SECTION</span>
              <span className="font-bold text-foreground">
                [{String(activeIndex).padStart(2, '0')}/{String(headings.length).padStart(2, '0')}]
              </span>
            </div>
          </FrameHeader>
          <FrameBody className="p-3 sm:p-4">
            {renderTocItems(false)}
          </FrameBody>
        </Frame>
      </aside>

      {/* Mobile Floating Blueprint Button & Drawer */}
      <div className="fixed right-5 bottom-6 z-40 lg:hidden">
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button
              className="relative size-11 border border-border bg-card text-foreground shadow-lg rounded-none transition-all hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px cursor-pointer"
              aria-label="Open Table of Contents"
            >
              <CornerBrackets className="size-2" />
              <List className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-[92vw] border border-border bg-card p-0 rounded-none shadow-2xl sm:max-w-md">
            <CornerBrackets />
            <div className="border-b border-border bg-muted/40 px-4 py-3">
              <DialogHeader className="p-0">
                <DialogTitle className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  <span className="flex items-center gap-2">
                    <List className="size-3.5" />
                    Table of Contents
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    [{String(activeIndex).padStart(2, '0')}/{String(headings.length).padStart(2, '0')}]
                  </span>
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-4">{renderTocItems(true)}</div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default TableOfContents
