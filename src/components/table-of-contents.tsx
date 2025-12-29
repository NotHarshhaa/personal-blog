'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/utils'
import { List } from 'lucide-react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui'

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
        // Wait for content to be rendered, then extract headings from DOM
        const extractHeadings = () => {
            const contentElement = document.querySelector('article.prose')
            if (!contentElement) {
                // Retry after a short delay if content isn't ready
                setTimeout(extractHeadings, 100)
                return
            }

            const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')

            const extractedHeadings: Heading[] = []
            headingElements.forEach((heading) => {
                const text = heading.textContent || ''
                if (!text.trim()) return

                const level = parseInt(heading.tagName.charAt(1))
                let id = heading.id

                // Generate ID if not present
                if (!id) {
                    id = text.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                        .substring(0, 50)

                    // Ensure uniqueness
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

        // Initial extraction
        extractHeadings()

        // Also listen for content changes
        const observer = new MutationObserver(extractHeadings)
        const contentElement = document.querySelector('article.prose')
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

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        const element = document.getElementById(id)
        if (element) {
            const offset = 100 // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })

            // Close mobile dialog after clicking
            setIsMobileOpen(false)
        }
    }

    if (headings.length === 0) return null

    const tocContent = (
        <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
            {headings.map((heading) => (
                <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    className={cn(
                        'block text-sm transition-colors duration-200 hover:text-primary py-1',
                        heading.level === 1 && 'font-semibold pl-0',
                        heading.level === 2 && 'pl-3',
                        heading.level === 3 && 'pl-6 text-xs',
                        heading.level >= 4 && 'pl-9 text-xs',
                        activeId === heading.id && 'text-primary font-medium'
                    )}
                >
                    {heading.text}
                </a>
            ))}
        </nav>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn('sticky top-24 hidden lg:block', className)}>
                <div className="rounded-lg border border-border/40 bg-white/90 dark:bg-zinc-900/90 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <List className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Table of Contents</h3>
                    </div>
                    {tocContent}
                </div>
            </div>

            {/* Mobile Floating Button & Dialog */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="icon"
                            className="rounded-full shadow-lg h-12 w-12 bg-primary hover:bg-primary/90"
                            aria-label="Open Table of Contents"
                        >
                            <List className="size-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <List className="size-4" />
                                Table of Contents
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {tocContent}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default TableOfContents

