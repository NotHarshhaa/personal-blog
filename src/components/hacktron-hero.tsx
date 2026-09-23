'use client'

import Link from 'next/link'
import { RssIcon } from 'lucide-react'
import { CornerBrackets } from '@/components/frame'
import TypingAnimation from '@/components/typing-animation'
import { SITE_NAME, SITE_TOPICS } from '@/lib/constants'

const TYPING_WORDS = [
  'Kubernetes clustering',
  'Terraform GitOps',
  'Distributed LLMOps',
  'Cloud Architecture',
  'Low-Latency MLOps',
  'Linux Kernel Internals'
] as const

export const HacktronHero = () => {
  return (
    <header className="relative w-full overflow-hidden border border-border bg-card">
      <CornerBrackets />

      {/* Top Technical Metadata Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">RESEARCH // ARCHITECTURE</span>
          <span className="hidden text-border sm:inline">|</span>
          <span className="hidden sm:inline">PLATFORM DISPATCH</span>
        </div>
        <div className="hidden font-mono text-muted-foreground/60 md:block select-none">
          % ( . ( )@) / . % ( % . . / @ ) / @ / ,% , % @
        </div>
      </div>

      {/* Hero Body with Cyber Matrix Dither Backdrop */}
      <div className="relative flex flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
            {SITE_NAME}
          </h1>

          <p className="font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
            Deep dives into{' '}
            <TypingAnimation
              words={TYPING_WORDS}
              className="font-medium text-foreground underline underline-offset-4 decoration-border"
            />
            , platform engineering, and high-reliability systems design.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/feed.xml"
              className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-semibold tracking-wider text-background uppercase transition-all duration-150 hover:bg-background hover:text-foreground"
            >
              <RssIcon className="size-3.5" />
              <span>Subscribe via RSS ↘</span>
            </Link>

            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase transition-all duration-150 hover:border-foreground hover:text-foreground"
            >
              <span>Email Dispatch ↗</span>
            </Link>
          </div>

          {/* Quick topic tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="mr-1 font-mono text-[10px] text-muted-foreground/70 uppercase">
              Topics:
            </span>
            {SITE_TOPICS.slice(0, 6).map((topic) => (
              <Link
                key={topic}
                href={`/?tag=${encodeURIComponent(topic)}`}
                className="inline-flex items-center gap-0.5 border border-border/80 bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase transition-colors hover:border-foreground hover:text-foreground"
              >
                <span className="text-muted-foreground/50">#</span>
                <span>{topic}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ASCII / Cyber Mesh Graphic (Monochromatic) */}
        <div
          aria-hidden
          className="pointer-events-none relative hidden select-none lg:block lg:w-96"
        >
          <div className="overflow-hidden border border-border/60 bg-muted/20 p-4 font-mono text-[8px] leading-[9px] text-muted-foreground/45 transition-colors">
            <pre className="font-mono">
{`    .--------------------------------.
   /  DevOps & AI Systems Platform   /|
  +--------------------------------+ |
  |  K8s.Cluster: READY            | |
  |  Nodes: 128    Pods: 4,096     | |
  |  Latency: 1.2ms [p99]          | |
  |  .-.     .-.     .-.     .-.   | |
  | (   )   (   )   (   )   (   )  | |
  |  '-'     '-'     '-'     '-'   | |
  |  GitOps: SYNCED [main@f83a02]  | |
  |  LLM Gateway: vLLM + Triton    | |
  |  TPS: 18,450 tok/s             | |
  |                                | |
  |  >> SYSTEM INTEGRITY 100%      | /
  '--------------------------------'`}
            </pre>
            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-1 text-[7px] text-muted-foreground/40 uppercase">
              <span>TELNET // 127.0.0.1</span>
              <span>SEC: MONO-2026</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HacktronHero
