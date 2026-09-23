'use client'

import { ExternalLinkIcon, MessageSquareIcon, SparklesIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'

type GiscusCommentsProps = {
  postId: string
  postTitle: string
}

export const GiscusComments = ({ postId, postTitle }: GiscusCommentsProps) => {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? 'NotHarshhaa/personal-blog'
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? ''
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'Announcements'
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? ''

  const isConfigured = Boolean(repo && repoId && categoryId)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mount Giscus script
  useEffect(() => {
    if (!mounted || !isConfigured || !containerRef.current) return

    const giscusTheme = resolvedTheme === 'dark' ? 'noborder_dark' : 'light'

    // Remove any existing script or iframe inside container
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.dataset.repo = repo
    script.dataset.repoId = repoId
    script.dataset.category = category
    script.dataset.categoryId = categoryId
    script.dataset.mapping = 'specific'
    script.dataset.term = postId
    script.dataset.strict = '0'
    script.dataset.reactionsEnabled = '1'
    script.dataset.emitMetadata = '0'
    script.dataset.inputPosition = 'top'
    script.dataset.theme = giscusTheme
    script.dataset.lang = 'en'
    script.dataset.loading = 'lazy'
    script.crossOrigin = 'anonymous'
    script.async = true

    containerRef.current.append(script)
  }, [mounted, isConfigured, repo, repoId, category, categoryId, postId, resolvedTheme])

  // PostMessage theme updates to Giscus iframe when theme toggles
  useEffect(() => {
    if (!isConfigured) return

    const giscusTheme = resolvedTheme === 'dark' ? 'noborder_dark' : 'light'
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      )
    }
  }, [resolvedTheme, isConfigured])

  return (
    <Frame as="section" aria-label="Article discussions">
      <FrameHeader label="Community Discussions">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquareIcon className="size-3.5" />
          <span>GitHub Discussions</span>
        </div>
      </FrameHeader>
      <FrameBody className="space-y-6">
        {isConfigured ? (
          <div ref={containerRef} className="giscus-wrapper min-h-[160px] w-full" />
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 border border-dashed border-border p-5 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Join the Discussion on {postTitle}
                </h3>
              </div>
              <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                Comments and Q&A are powered by GitHub Discussions. To enable them with zero maintenance, add your repository IDs to your environment variables or visit{' '}
                <a
                  href="https://giscus.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  giscus.app
                </a>.
              </p>
            </div>
            <a
              href={`https://github.com/${repo}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 border border-border bg-background px-3 py-1.5 font-mono text-xs font-medium text-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              <span>GitHub Discussions</span>
              <ExternalLinkIcon className="size-3" />
            </a>
          </div>
        )}
      </FrameBody>
    </Frame>
  )
}

export default GiscusComments
