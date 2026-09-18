import type { Metadata } from 'next'

import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  CompassIcon,
  CpuIcon,
  FileCodeIcon,
  LayersIcon
} from 'lucide-react'
import Link from 'next/link'
import readingTime from 'reading-time'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'
import { getPosts } from '@/queries/get-posts'
import { getAllSeries } from '@/queries/get-series'

export const metadata: Metadata = {
  title: 'DevOps & AI Architecture Roadmaps',
  description:
    'Sequential, end-to-end learning roadmaps and structured series on Kubernetes, Cloud Platform Engineering, MLOps, and Production AI Infrastructure.'
}

type RoadmapTrack = {
  id: string
  title: string
  slug: string
  difficulty: string
  competencies: string[]
  description?: string | null
  posts: Array<{
    id: string
    title: string
    description?: string | null
    tags?: string[]
  }>
}

const RoadmapsPage = async () => {
  const { series: dbSeries } = await getAllSeries()
  const { posts: allPosts } = await getPosts()

  // Curate comprehensive tracks from existing posts if series are not yet populated in DB
  const defaultTracks = [
    {
      id: 'k8s-track',
      title: 'Kubernetes & Platform Engineering Roadmap',
      slug: 'kubernetes-platform-engineering',
      difficulty: 'INTERMEDIATE // ADVANCED',
      competencies: [
        'Multi-node bare-metal & cloud cluster architecture',
        'Cilium eBPF networking, Ingress controllers & Service Mesh',
        'GitOps CD pipelines with ArgoCD & Kustomize',
        'Production Prometheus/Grafana observability & SLOs'
      ],
      description:
        'Master bare-metal and cloud cluster topologies, production ingress, zero-drift GitOps deployments, and high-availability operations from the ground up.',
      posts: allPosts
        .filter((p) =>
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
      title: 'LLMOps & Production AI Infrastructure Roadmap',
      slug: 'llmops-ai-infrastructure',
      difficulty: 'ADVANCED // PRODUCTION',
      competencies: [
        'High-throughput model serving with vLLM & Triton',
        'PagedAttention, continuous batching & speculative decoding',
        'Distributed GPU clustering & multi-node NCCL networking',
        'Quantization (AWQ/GPTQ/FP8) & low-latency inference routing'
      ],
      description:
        'Deep-dive into speculative decoding, continuous batching, distributed multi-GPU training, and low-latency inference serving on modern hardware.',
      posts: allPosts
        .filter((p) =>
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
      ? dbSeries.map((s, idx) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          difficulty: idx % 2 === 0 ? 'INTERMEDIATE // ADVANCED' : 'ADVANCED // PRODUCTION',
          competencies: [
            'Architectural foundations & core principles',
            'Practical implementation & automated workflows',
            'Performance tuning & enterprise security',
            'Production monitoring, reliability & incident response'
          ],
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
            difficulty: t.difficulty,
            competencies: t.competencies,
            description: t.description,
            posts: t.posts.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description
            }))
          }))

  const PHASE_NAMES = [
    'PHASE 01 // ARCHITECTURAL FOUNDATION',
    'PHASE 02 // NETWORKING & ORCHESTRATION',
    'PHASE 03 // AUTOMATION & GITOPS DEPLOYMENT',
    'PHASE 04 // SRE, RESILIENCE & OBSERVABILITY'
  ]

  return (
    <div className="relative z-10 w-full space-y-8 sm:space-y-10">
      {/* HEADER HERO */}
      <Frame as="header">
        <FrameHeader label="CURRICULUM // ENGINEERING SYLLABUS">
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 border border-border/80 bg-muted/30 px-1.5 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{tracks.length} PRODUCTION TRACKS ACTIVE</span>
            </span>
          </div>
        </FrameHeader>
        <FrameBody className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <CompassIcon className="size-3.5 text-foreground" />
              <span>SYSTEMATIC STEP-BY-STEP MASTERY</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              DevOps & AI Architecture Roadmaps
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Step-by-step sequential learning pipelines designed to take you from foundational concepts
              to multi-region production platforms without skipping the edge cases or engineering trade-offs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs text-muted-foreground">
            <span className="border border-border bg-background px-2.5 py-1">
              ✓ SEQUENTIAL LEARNING TRACKS
            </span>
            <span className="border border-border bg-background px-2.5 py-1">
              ✓ REAL REPOSITORIES & CODE
            </span>
            <span className="border border-border bg-background px-2.5 py-1">
              ✓ PRODUCTION DEPLOYMENT VALIDATED
            </span>
          </div>
        </FrameBody>
      </Frame>

      {/* TRACKS LIST */}
      {tracks.length === 0 ? (
        <Frame>
          <FrameHeader label="ROADMAP STATUS" />
          <FrameBody className="py-16 text-center text-muted-foreground space-y-3 font-mono text-xs">
            <p>No structured tracks published in database yet.</p>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 border border-border bg-foreground px-4 py-2 text-background font-semibold uppercase hover:bg-foreground/90 transition-colors"
              >
                <span>Browse All Articles [→]</span>
              </Link>
            </div>
          </FrameBody>
        </Frame>
      ) : (
        <div className="space-y-8">
          {tracks.map((track, trackIdx) => {
            let totalMinutes = 0
            for (const p of track.posts) {
              const minutes = readingTime(p.description ?? p.title).minutes
              totalMinutes += Math.ceil(minutes)
            }

            return (
              <Frame key={track.id} className="relative">
                <FrameHeader label={`TRACK // 0${trackIdx + 1}`}>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs text-muted-foreground">
                    <span className="border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] text-foreground font-semibold">
                      {track.difficulty}
                    </span>
                    <span>{track.posts.length} MODULES</span>
                    <span>•</span>
                    <span>~{totalMinutes} MIN CURRICULUM</span>
                  </div>
                </FrameHeader>

                <FrameBody className="space-y-6">
                  {/* Track Overview */}
                  <div className="space-y-2 border-b border-border pb-5">
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {track.title}
                    </h2>
                    {track.description && (
                      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {track.description}
                      </p>
                    )}
                  </div>

                  {/* Competencies Checklist */}
                  <div className="space-y-2.5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      // CORE COMPETENCIES COVERED IN THIS TRACK:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {track.competencies.map((comp) => (
                        <div
                          key={comp}
                          className="flex items-start gap-2 border border-border/70 bg-muted/20 p-2.5 font-mono text-xs text-muted-foreground"
                        >
                          <CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sequential Architecture Pipeline Nodes */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        // SEQUENTIAL MODULE PIPELINE
                      </p>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        READ IN ORDER
                      </span>
                    </div>

                    <div className="relative space-y-3">
                      {/* Vertical timeline connector line */}
                      <div className="absolute left-[1.125rem] top-4 bottom-4 w-px bg-border hidden sm:block pointer-events-none" />

                      {track.posts.map((post, stepIdx) => {
                        const readStats = readingTime(post.description ?? post.title).text
                        const phaseName =
                          PHASE_NAMES[stepIdx] ?? `PHASE 0${stepIdx + 1} // ADVANCED TOPIC`

                        return (
                          <HoverMark
                            key={post.id}
                            label="Open Module"
                            className="relative border border-border bg-card transition-colors hover:bg-muted/30 p-4 sm:p-5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                {/* Step number badge with connector node */}
                                <div className="relative z-10 flex size-9 shrink-0 items-center justify-center border border-border bg-background font-mono text-xs font-bold text-foreground">
                                  0{stepIdx + 1}
                                </div>

                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
                                    <span className="text-foreground font-semibold">
                                      {phaseName}
                                    </span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <ClockIcon className="size-3" />
                                      <span>{readStats}</span>
                                    </div>
                                  </div>

                                  <Link
                                    href={`/posts/${post.id}`}
                                    className="block text-base font-bold tracking-tight text-foreground hover:underline decoration-1 underline-offset-4"
                                  >
                                    {post.title}
                                  </Link>

                                  {post.description && (
                                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                      {post.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center justify-end pt-1 sm:pt-0 self-end sm:self-center">
                                <Link
                                  href={`/posts/${post.id}`}
                                  className="inline-flex items-center gap-1.5 border border-border bg-foreground px-3.5 py-1.5 font-mono text-xs font-semibold uppercase text-background hover:bg-foreground/90 transition-colors"
                                >
                                  <span>Start Module</span>
                                  <ArrowRightIcon className="size-3" />
                                </Link>
                              </div>
                            </div>
                          </HoverMark>
                        )
                      })}
                    </div>
                  </div>
                </FrameBody>
              </Frame>
            )
          })}
        </div>
      )}

      {/* LOCAL PRACTICE LAB BLUEPRINT */}
      <section aria-labelledby="lab-heading">
        <Frame>
          <FrameHeader label="EXECUTION LAB // RECOMMENDED LOCAL TOOLING">
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span>ZERO-COST TESTING LABS</span>
            </div>
          </FrameHeader>
          <FrameBody className="space-y-4">
            <div className="space-y-1">
              <h3 id="lab-heading" className="text-lg font-bold text-foreground">
                How to Practice These Architectures Locally
              </h3>
              <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                You don't need a multi-thousand-dollar cloud bill to master these roadmaps. Every configuration
                in these tracks can be spun up in lightweight local sandboxes:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs">
              <div className="border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <LayersIcon className="size-4 text-cyan-500" />
                  <span>KIND / K3D</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Run multi-node Kubernetes clusters inside Docker containers in seconds. Supports Cilium eBPF installation.
                </p>
                <div className="bg-background border border-border/60 p-2 text-[10px] text-muted-foreground">
                  <code>kind create cluster --config k8s.yaml</code>
                </div>
              </div>

              <div className="border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <FileCodeIcon className="size-4 text-emerald-500" />
                  <span>LOCALSTACK</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Emulate AWS services (S3, SQS, IAM, DynamoDB, VPC) locally on your laptop without AWS credentials or charges.
                </p>
                <div className="bg-background border border-border/60 p-2 text-[10px] text-muted-foreground">
                  <code>docker run -p 4566:4566 localstack</code>
                </div>
              </div>

              <div className="border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <CpuIcon className="size-4 text-purple-500" />
                  <span>OLLAMA / vLLM</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Benchmark OpenAI-compatible model serving APIs locally with quantized weights (Q4/AWQ) on consumer GPUs or Apple Silicon.
                </p>
                <div className="bg-background border border-border/60 p-2 text-[10px] text-muted-foreground">
                  <code>vllm serve meta-llama/Llama-3-8B</code>
                </div>
              </div>
            </div>
          </FrameBody>
        </Frame>
      </section>
    </div>
  )
}

export default RoadmapsPage
