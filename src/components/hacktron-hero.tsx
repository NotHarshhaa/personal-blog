'use client'

import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CompassIcon,
  MailIcon,
  RssIcon,
  SquareTerminalIcon
} from 'lucide-react'
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

const WORKSPACE_INDEX = [
  {
    href: '/snippets',
    code: '01',
    title: 'Snippet Vault',
    note: 'CLI one-liners & curl-ready configs',
    icon: SquareTerminalIcon
  },
  {
    href: '/roadmaps',
    code: '02',
    title: 'Engineering Roadmaps',
    note: 'Structured K8s & AI infra tracks',
    icon: CompassIcon
  },
  {
    href: '/newsletter',
    code: '03',
    title: 'Bi-Weekly Dispatch',
    note: 'Production notes straight to inbox',
    icon: MailIcon
  }
] as const

export const HacktronHero = () => {
  return (
    <header className='border-border bg-card relative w-full overflow-hidden border'>
      <CornerBrackets />

      {/* Blueprint status strip */}
      <StripHeader
        left={
          <>
            <span className='bg-success size-1.5 rounded-full' aria-hidden />
            <span className='text-foreground font-semibold'>Research // Architecture</span>
            <span className='text-border hidden sm:inline'>|</span>
            <span className='hidden sm:inline'>Platform engineering dispatch</span>
          </>
        }
        right={<ViewsBadge className='px-0 py-0' />}
      />

      {/* Asymmetric 12-column editorial split */}
      <div className='grid grid-cols-1 lg:grid-cols-12'>
        {/* Left: Primary Editorial Identity */}
        <div className='flex flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-8 lg:p-10'>
          <div className='max-w-2xl space-y-4'>
            <h1 className='font-heading text-foreground cursor-default text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]'>
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

            <div className='flex flex-wrap items-center gap-2.5 pt-2'>
              <Button asChild variant='default' corners>
                <a href='#archive'>
                  <span>Explore Archive</span>
                  <ArrowRightIcon className='size-3.5' />
                </a>
              </Button>

              <Button asChild variant='outline' corners>
                <Link href='/newsletter'>
                  <span>Email Dispatch ↗</span>
                </Link>
              </Button>

              <Button asChild variant='ghost' size='sm'>
                <a href='/feed.xml' target='_blank' rel='noopener noreferrer'>
                  <RssIcon className='size-3.5' />
                  <span>RSS</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Quick topic tags */}
          <div className='border-border/70 flex flex-wrap items-center gap-1.5 border-t pt-4'>
            <span className='text-muted-foreground mr-1 font-mono text-[10px] tracking-widest uppercase'>
              Index:
            </span>
            {SITE_TOPICS.slice(0, 6).map((topic) => (
              <Link
                key={topic}
                href={`/?tag=${encodeURIComponent(topic)}`}
                className='hover-fill border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex items-center gap-0.5 border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase transition-colors'
              >
                <span className='text-muted-foreground/80'>#</span>
                <span>{topic}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Architectural Workspace Rail */}
        <aside
          aria-label='Workspace directory'
          className='border-border bg-muted/25 flex flex-col justify-between border-t lg:col-span-4 lg:border-t-0 lg:border-l'
        >
          <div className='border-border flex items-center justify-between border-b px-5 py-2.5 font-mono text-[10px] tracking-widest uppercase'>
            <span className='text-foreground font-semibold'>{'// Workspace index'}</span>
            <span className='text-muted-foreground'>03 Modules</span>
          </div>

          <div className='divide-border flex-1 divide-y'>
            {WORKSPACE_INDEX.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='hover-fill group flex items-center justify-between gap-3 px-5 py-4 transition-colors'
              >
                <div className='flex min-w-0 items-start gap-3'>
                  <span className='border-border bg-background text-muted-foreground group-hover:border-foreground group-hover:text-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center border font-mono text-[10px] font-bold transition-colors'>
                    {item.code}
                  </span>
                  <div className='min-w-0'>
                    <p className='font-heading text-foreground flex items-center gap-1.5 text-sm font-semibold tracking-tight group-hover:underline'>
                      <item.icon className='text-muted-foreground size-3.5 shrink-0' aria-hidden />
                      <span className='truncate'>{item.title}</span>
                    </p>
                    <p className='text-muted-foreground mt-0.5 truncate text-xs'>{item.note}</p>
                  </div>
                </div>
                <ArrowUpRightIcon
                  className='text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                  aria-hidden
                />
              </Link>
            ))}
          </div>

          <div className='border-border bg-card/60 text-muted-foreground flex items-center justify-between border-t px-5 py-2.5 font-mono text-[10px] tracking-wider uppercase'>
            <a
              href='#terminal'
              className='hover:text-foreground inline-flex items-center gap-1.5 transition-colors'
            >
              <SquareTerminalIcon className='size-3' aria-hidden />
              <span>Launch guest shell ↓</span>
            </a>
            <span className='text-success font-semibold'>Ready</span>
          </div>
        </aside>
      </div>
    </header>
  )
}

export default HacktronHero
