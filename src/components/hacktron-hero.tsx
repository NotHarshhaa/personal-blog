'use client'

import { RssIcon } from 'lucide-react'
import Link from 'next/link'

import CipherText from '@/components/cipher-text'
import { CornerBrackets, StripHeader } from '@/components/frame'
import TypingAnimation from '@/components/typing-animation'
import { Button } from '@/components/ui'
import { ViewsBadge } from '@/components/views-badge'
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
    <header className='border-border bg-card relative w-full overflow-hidden border'>
      <CornerBrackets />

      {/* Blueprint status strip */}
      <StripHeader
        left={
          <>
            <span className='text-foreground font-semibold'>Research // Architecture</span>
            <span className='text-border hidden sm:inline'>|</span>
            <span className='hidden sm:inline'>Platform dispatch</span>
          </>
        }
        right={<ViewsBadge className='px-0 py-0' />}
      />

      {/* Hero Body */}
      <div className='relative flex flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10'>
        <div className='relative z-10 max-w-2xl space-y-5'>
          <h1 className='font-heading text-foreground cursor-default text-3xl font-medium tracking-tight text-balance sm:text-4xl lg:text-5xl'>
            <CipherText scrambleOnHover text={SITE_NAME}>
              {SITE_NAME}
            </CipherText>
          </h1>

          <p className='text-muted-foreground font-sans text-sm leading-relaxed sm:text-base'>
            Deep dives into{' '}
            <TypingAnimation
              words={TYPING_WORDS}
              className='text-foreground decoration-border font-medium underline underline-offset-4'
            />
            , platform engineering, and high-reliability systems design.
          </p>

          <div className='flex flex-wrap items-center gap-3 pt-1'>
            <Button asChild variant='default' corners>
              <Link href='/feed.xml'>
                <RssIcon className='size-3.5' />
                <span>Subscribe via RSS ↘</span>
              </Link>
            </Button>

            <Button asChild variant='outline' corners>
              <Link href='/newsletter'>
                <span>Email Dispatch ↗</span>
              </Link>
            </Button>
          </div>

          {/* Quick topic tags */}
          <div className='flex flex-wrap items-center gap-1.5 pt-2'>
            <span className='text-muted-foreground/70 mr-1 font-mono text-[10px] tracking-widest uppercase'>
              Topics:
            </span>
            {SITE_TOPICS.slice(0, 6).map((topic) => (
              <Link
                key={topic}
                href={`/?tag=${encodeURIComponent(topic)}`}
                className='hover-fill border-border/80 bg-background/60 text-muted-foreground hover:border-foreground hover:text-foreground inline-flex items-center gap-0.5 border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase transition-colors'
              >
                <span className='text-muted-foreground/50'>#</span>
                <span>{topic}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ASCII / Cyber Mesh Console (Monochromatic) */}
        <div
          aria-hidden
          className='group pointer-events-none relative hidden select-none lg:block lg:w-96'
        >
          <div className='border-border/60 bg-muted/20 group-hover:border-foreground/40 overflow-hidden border transition-colors'>
            {/* Console header strip */}
            <div className='text-muted-foreground/60 border-border/60 flex items-center justify-between border-b px-3 py-1.5 font-mono text-[8px] tracking-widest uppercase'>
              <span className='inline-flex items-center gap-1.5'>
                <span className='bg-foreground/60 inline-block size-1.5 animate-pulse rounded-full' />
                <span>SYS.console // telnet</span>
              </span>
              <span>SEC: MONO-2026</span>
            </div>

            <pre className='text-muted-foreground/45 p-4 font-mono text-[8px] leading-[9px] transition-colors'>
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

            <div className='text-muted-foreground/40 border-border/60 flex items-center justify-between border-t px-3 py-1.5 font-mono text-[7px] tracking-widest uppercase'>
              <span>127.0.0.1 // port 23</span>
              <span>Uptime: 99.98%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HacktronHero
