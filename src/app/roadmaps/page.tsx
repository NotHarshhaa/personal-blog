import type { Metadata } from 'next'

import { ArrowRightIcon, LayersIcon } from 'lucide-react'
import Link from 'next/link'
import readingTime from 'reading-time'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { getPosts } from '@/queries/get-posts'
import { getAllSeries } from '@/queries/get-series'

export const metadata: Metadata = {
  title: 'Learning Roadmaps & Series',
  description:
    'Sequential, end-to-end learning tracks on DevOps, Cloud Platform Engineering, MLOps, and Production AI Infrastructure.'
}

type RoadmapTrack = {
  id: string
  title: string
  slug: string
  description?: string | null
  posts: Array<{
    id: string
    title: string
    description?: string | null
  }>
}

const RoadmapsPage = async () => {
  const { series: dbSeries } = await getAllSeries()
  const { posts: allPosts } = await getPosts()

  // Curate comprehensive tracks from existing posts if series are not yet populated in DB
  const defaultTracks = [
    {
      id: 'k8s-track',
      title: 'Kubernetes & Platform Engineering Track',
      slug: 'kubernetes-platform-engineering',
      description:
        'Master cluster architecture, production ingress, gitops deployments, and high-availability operations.',
      posts: allPosts
        .filter(
          (p) =>
            p.tags.some((t) =>
              ['devops', 'kubernetes', 'cloud', 'platform engineering'].includes(
                t.toLowerCase()
              )
            )
        )
        .slice(0, 4)
    },
    {
      id: 'ai-infra-track',
      title: 'LLMOps & Production AI Infrastructure',
      slug: 'llmops-ai-infrastructure',
      description:
        'Deep-dive into speculative decoding, mixture-of-experts clustering, distributed training, and low-latency model serving.',
      posts: allPosts
        .filter(
          (p) =>
            p.tags.some((t) =>
              ['ai', 'mlops', 'llmops', 'genai', 'ai infrastructure'].includes(
                t.toLowerCase()
              )
            )
        )
        .slice(0, 4)
    }
  ]

  const tracks: RoadmapTrack[] =
    dbSeries.length > 0
      ? dbSeries.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          posts: s.posts.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description
          }))
        }))
      : defaultTracks
          .filter((t) => t.posts.length > 0)
          .map((t) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            description: t.description,
            posts: t.posts.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description
            }))
          }))

  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <Frame as="header">
        <FrameHeader label="Curriculum" />
        <FrameBody className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase">
            <LayersIcon className="size-4" />
            <span>Structured Tracks</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            DevOps & AI Roadmaps
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Step-by-step sequential tracks designed to take you from core concepts
            to production architecture without skipping the difficult parts.
          </p>
        </FrameBody>
      </Frame>

      {tracks.length === 0 ? (
        <Frame>
          <FrameHeader label="Roadmaps" />
          <FrameBody className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No structured tracks published yet.</p>
            <Link
              href="/"
              className="mt-4 inline-block border border-border px-3 py-1.5 font-mono text-xs uppercase hover:border-foreground"
            >
              Browse all articles
            </Link>
          </FrameBody>
        </Frame>
      ) : (
        <div className="space-y-6">
          {tracks.map((track, trackIdx) => {
            let totalMinutes = 0
            for (const p of track.posts) {
              const minutes = readingTime(p.description ?? p.title).minutes
              totalMinutes += Math.ceil(minutes)
            }

            return (
              <Frame key={track.id}>
                <FrameHeader label={`Track 0${trackIdx + 1}`}>
                  <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                    <span>{track.posts.length} PARTS</span>
                    <span aria-hidden>·</span>
                    <span>~{totalMinutes} MIN READ</span>
                  </div>
                </FrameHeader>
                <FrameBody className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                      {track.title}
                    </h2>
                    {track.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {track.description}
                      </p>
                    )}
                  </div>

                  {/* Sequential Track Steps */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      Curriculum Outline
                    </p>
                    <div className="divide-y divide-border border border-border">
                      {track.posts.map((post, stepIdx) => (
                        <Link
                          key={post.id}
                          href={`/posts/${post.id}`}
                          className="group flex flex-col justify-between gap-2 p-3 text-sm transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:px-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                              0{stepIdx + 1}.
                            </span>
                            <span className="truncate font-medium tracking-tight group-hover:text-foreground">
                              {post.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end text-xs text-muted-foreground sm:self-center">
                            <span className="font-mono text-[11px]">
                              {readingTime(post.description ?? post.title).text}
                            </span>
                            <ArrowRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </FrameBody>
              </Frame>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RoadmapsPage
