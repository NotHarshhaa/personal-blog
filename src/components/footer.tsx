'use client'

import { SiGithub, SiInstagram, SiTelegram, SiX } from '@icons-pack/react-simple-icons'
import { ArrowUp, CheckCircleIcon, RssIcon, SendIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { subscribeNewsletterAction } from '@/actions/subscribe-newsletter-action'
import { Frame } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'

type Links = Array<{
  href: string
  icon: React.ReactNode
  label: string
  handle: string
}>

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const Footer = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const links: Links = [
    {
      href: 'https://github.com/NotHarshhaa',
      icon: <SiGithub className='size-3.5' />,
      label: 'GitHub',
      handle: 'NotHarshhaa'
    },
    {
      href: 'https://x.com/NotHarshhaa',
      icon: <SiX className='size-3.5' />,
      label: 'X / Twitter',
      handle: '@NotHarshhaa'
    },
    {
      href: 'https://t.me/prodevopsguy',
      icon: <SiTelegram className='size-3.5' />,
      label: 'Telegram',
      handle: 'prodevopsguy'
    },
    {
      href: 'https://www.instagram.com/harshhaareddy/',
      icon: <SiInstagram className='size-3.5' />,
      label: 'Instagram',
      handle: '@harshhaareddy'
    }
  ]

  const directoryLinks = [
    { href: '/', code: '01', label: 'Engineering Articles' },
    { href: '/snippets', code: '02', label: 'Snippet Vault / TIL' },
    { href: '/roadmaps', code: '03', label: 'DevOps Roadmaps' },
    { href: '/bookmarks', code: '04', label: 'Reading Bookmarks' },
    { href: '/newsletter', code: '05', label: 'Bi-Weekly Notes' },
    { href: '/feed.xml', code: '06', label: 'RSS 2.0 Feed', external: true }
  ]

  const handleSubscribe = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    try {
      const res = await subscribeNewsletterAction({ email })
      if (res?.data?.success) {
        setIsSubscribed(true)
        setEmail('')
        toast.success(res.data.message)
      } else {
        toast.error(res?.serverError ?? 'Failed to subscribe. Please try again.')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className='relative z-10 mt-auto'>
      <div className='mx-auto max-w-[90rem] px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8'>
        <Frame>
          {/* Blueprint status strip */}
          <div className='border-border/80 bg-muted/30 relative overflow-hidden border-b'>
            <div
              aria-hidden
              className='absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] [background-size:14px_14px] opacity-50'
            />
            <div className='text-muted-foreground relative flex items-center justify-between gap-2 px-4 py-2 font-mono text-[9px] tracking-widest uppercase sm:px-5'>
              <span className='inline-flex items-center gap-1.5'>
                <span className='relative flex size-1.5'>
                  <span className='bg-foreground/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
                  <span className='bg-foreground relative inline-flex size-1.5 rounded-full' />
                </span>
                <span className='text-foreground font-semibold'>All systems operational</span>
              </span>
              <span className='hidden sm:inline'>Region: global_edge // build v2.4</span>
            </div>
          </div>

          {/* Main grid */}
          <div className='grid grid-cols-1 lg:grid-cols-12'>
            {/* CELL 1: ABOUT */}
            <div className='border-border space-y-3 border-b p-5 lg:col-span-4 lg:border-r lg:border-b-0'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
                {'// 01: Architecture'}
              </p>
              <p className='text-muted-foreground text-xs leading-relaxed sm:text-sm'>
                Production-grade tutorials, architecture blueprints, and field notes on DevOps,
                Kubernetes, Terraform, Platform Engineering, AI/ML, and LLMOps. Built for engineers
                deploying systems at scale.
              </p>
              <div className='flex flex-wrap gap-1.5 font-mono text-[10px]'>
                {['K8S', 'TERRAFORM', 'GITOPS', 'LLMOps', 'AI_INFRA', 'AWS', 'DOCKER'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className='border-border/80 bg-muted/40 text-muted-foreground border px-1.5 py-0.5'
                    >
                      #{tag}
                    </span>
                  )
                )}
              </div>
              <p className='text-muted-foreground pt-1 font-mono text-[11px]'>
                Author &amp; Maintainer:{' '}
                <span className='text-foreground font-semibold'>Harshhaa Reddy</span>
              </p>
            </div>

            {/* CELL 2: DISPATCH NEWSLETTER */}
            <div className='border-border space-y-3 border-b p-5 lg:col-span-4 lg:border-r lg:border-b-0'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
                {'// 02: Dispatch'}
              </p>
              <p className='text-muted-foreground text-xs leading-relaxed sm:text-sm'>
                Receive bi-weekly deep dives into production architecture, zero-downtime
                deployments, and distributed systems.
              </p>

              {isSubscribed ? (
                <div className='border-foreground/30 bg-foreground/5 text-foreground flex items-center gap-2 border p-3 font-medium'>
                  <CheckCircleIcon className='size-4 shrink-0' />
                  <span className='font-mono text-xs'>
                    Subscription verified! You are on the dispatch list.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className='flex flex-col gap-2 sm:flex-row'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='engineer@company.com'
                    className='border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-foreground h-9 min-w-0 flex-1 border px-3 font-mono text-xs transition-colors outline-none'
                    required
                  />
                  <button
                    type='submit'
                    disabled={loading}
                    className='border-border bg-foreground text-background hover:bg-foreground/90 inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border px-4 font-mono text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-50'
                  >
                    <SendIcon className='size-3' />
                    <span>{loading ? 'Joining...' : 'Subscribe'}</span>
                  </button>
                </form>
              )}

              <p className='text-muted-foreground/70 font-mono text-[10px]'>
                🔒 Strictly technical writeups. Zero marketing fluff.
              </p>
            </div>

            {/* CELL 3: DIRECTORY */}
            <div className='border-border space-y-3 border-b p-5 lg:col-span-2 lg:border-r lg:border-b-0'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
                {'// 03: Directory'}
              </p>
              <ul className='-mx-1 space-y-1 font-mono text-xs'>
                {directoryLinks.map((item) => (
                  <li key={item.href}>
                    <HoverMark label='Navigate' className='px-1 py-1'>
                      {item.external ? (
                        <a
                          href={item.href}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-muted-foreground group hover:text-foreground flex items-center gap-2 transition-colors'
                        >
                          <span className='text-muted-foreground/60 shrink-0'>[{item.code}]</span>
                          <span className='truncate group-hover:underline'>{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className='text-muted-foreground group hover:text-foreground flex items-center gap-2 transition-colors'
                        >
                          <span className='text-muted-foreground/60 shrink-0'>[{item.code}]</span>
                          <span className='truncate group-hover:underline'>{item.label}</span>
                        </Link>
                      )}
                    </HoverMark>
                  </li>
                ))}
              </ul>
            </div>

            {/* CELL 4: NETWORK & TELEMETRY */}
            <div className='space-y-3 p-5 lg:col-span-2'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
                {'// 04: Connect'}
              </p>
              <ul className='-mx-1 space-y-1 font-mono text-xs'>
                {links.map((link) => (
                  <li key={link.href}>
                    <HoverMark label='Connect' className='px-1 py-1'>
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors'
                      >
                        {link.icon}
                        <span className='truncate'>{link.label}</span>
                      </a>
                    </HoverMark>
                  </li>
                ))}
              </ul>

              <div className='flex flex-wrap gap-1.5 pt-1 font-mono text-[9px]'>
                {['NEXT.JS 15', 'DRIZZLE', 'POSTGRESQL'].map((tech) => (
                  <span
                    key={tech}
                    className='border-border/80 bg-muted/40 text-muted-foreground border px-1.5 py-0.5'
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SUB-FOOTER SYSTEM BAR */}
          <div className='border-border text-muted-foreground bg-muted/10 flex flex-col items-center justify-between gap-3 border-t px-4 py-3 font-mono text-[11px] sm:flex-row sm:px-5'>
            <div className='flex items-center gap-2'>
              <span>© {new Date().getFullYear()} HARSHHAA REDDY. ALL RIGHTS RESERVED.</span>
            </div>
            <div className='flex items-center gap-3 sm:gap-4'>
              <Link
                href='/privacy'
                className='hover:text-foreground px-1 py-0.5 underline underline-offset-4 transition-colors'
              >
                Privacy Policy
              </Link>
              <span className='text-border'>•</span>
              <a
                href='/feed.xml'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-foreground inline-flex items-center gap-1 px-1 py-0.5 transition-colors'
              >
                <RssIcon className='text-foreground size-3' />
                RSS
              </a>
              <span className='text-border'>•</span>
              <button
                type='button'
                onClick={scrollToTop}
                className='text-foreground inline-flex cursor-pointer items-center gap-1 px-1 py-0.5 hover:underline'
              >
                <span>TOP</span>
                <ArrowUp className='size-3' />
              </button>
            </div>
          </div>
        </Frame>
      </div>
    </footer>
  )
}

export default Footer
