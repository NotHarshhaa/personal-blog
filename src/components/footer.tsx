'use client'

import { SiGithub, SiInstagram, SiTelegram, SiX } from '@icons-pack/react-simple-icons'
import { ArrowUp, CheckCircleIcon, RssIcon, SendIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { subscribeNewsletterAction } from '@/actions/subscribe-newsletter-action'
import {
  Frame,
  FrameGrid,
  FrameGridCell,
  FrameHeader
} from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'

type Links = Array<{
  href: string
  icon: React.ReactNode
  label: string
  handle: string
}>

const Footer = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const links: Links = [
    {
      href: 'https://github.com/NotHarshhaa',
      icon: <SiGithub className="size-3.5" />,
      label: 'GitHub',
      handle: 'NotHarshhaa'
    },
    {
      href: 'https://x.com/NotHarshhaa',
      icon: <SiX className="size-3.5" />,
      label: 'X / Twitter',
      handle: '@NotHarshhaa'
    },
    {
      href: 'https://t.me/prodevopsguy',
      icon: <SiTelegram className="size-3.5" />,
      label: 'Telegram',
      handle: 'prodevopsguy'
    },
    {
      href: 'https://www.instagram.com/harshhaareddy/',
      icon: <SiInstagram className="size-3.5" />,
      label: 'Instagram',
      handle: '@harshhaareddy'
    }
  ]

  const directoryLinks = [
    { href: '/', code: '01', label: 'Engineering Articles', path: '/posts' },
    { href: '/roadmaps', code: '02', label: 'DevOps Roadmaps', path: '/roadmaps' },
    { href: '/bookmarks', code: '03', label: 'Reading Bookmarks', path: '/bookmarks' },
    { href: '/newsletter', code: '04', label: 'Bi-Weekly Notes', path: '/newsletter' },
    { href: '/feed.xml', code: '05', label: 'RSS 2.0 Feed', path: '/feed.xml', external: true }
  ]

  const handleSubscribe = async (e: React.FormEvent) => {
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

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative z-10 mt-auto">
      <div className="mx-auto max-w-[90rem] px-4 pt-8 pb-4 sm:px-6 sm:py-14 lg:px-8">
        <Frame>
          <FrameHeader label="SYSTEM ARCHITECTURE & FOOTER // v2.4">
            <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-foreground" />
                </span>
                <span className="text-foreground font-semibold uppercase">ALL_SYSTEMS_OPERATIONAL</span>
              </span>
              <span className="hidden md:inline text-border">|</span>
              <span className="hidden md:inline">REGION: GLOBAL_EDGE</span>
            </div>
          </FrameHeader>

          <FrameGrid className="border-t-0">
            {/* CELL 1: ABOUT */}
            <FrameGridCell label="// 01: ARCHITECTURE" className="border-b border-border sm:border-r sm:border-b p-5">
              <div className="space-y-3">
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Production-grade tutorials, architecture blueprints, and field notes on DevOps,
                  Kubernetes, Terraform, Platform Engineering, AI/ML, and LLMOps. Built for engineers deploying systems at scale.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {['K8S', 'TERRAFORM', 'GITOPS', 'LLMOps', 'AI_INFRA', 'AWS', 'DOCKER'].map((tag) => (
                    <span
                      key={tag}
                      className="border border-border/80 bg-muted/40 px-1.5 py-0.5 text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="font-mono text-[11px] text-muted-foreground pt-1">
                  Author & Maintainer: <span className="font-semibold text-foreground">Harshhaa Reddy</span>
                </p>
              </div>
            </FrameGridCell>

            {/* CELL 2: DISPATCH NEWSLETTER */}
            <FrameGridCell label="// 02: DISPATCH" className="border-b border-border sm:border-b p-5">
              <div className="space-y-3">
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Receive bi-weekly deep dives into production architecture, zero-downtime deployments, and distributed systems.
                </p>

                {isSubscribed ? (
                  <div className="flex items-center gap-2 border border-foreground/30 bg-foreground/5 p-3 text-foreground font-medium">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span className="font-mono text-xs">
                      Subscription verified! You are on the dispatch list.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="h-9 min-w-0 flex-1 border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-9 items-center justify-center gap-1.5 border border-border bg-foreground px-4 font-mono text-xs font-semibold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
                    >
                      <SendIcon className="size-3" />
                      <span>{loading ? 'Joining...' : 'Subscribe'}</span>
                    </button>
                  </form>
                )}

                <p className="font-mono text-[10px] text-muted-foreground/70">
                  🔒 Strictly technical writeups. Zero marketing fluff.
                </p>
              </div>
            </FrameGridCell>

            {/* CELL 3: INDEX */}
            <FrameGridCell label="// 03: DIRECTORY" className="border-b border-border sm:border-r sm:border-b-0 p-5">
              <ul className="-mx-1 space-y-1 font-mono text-xs">
                {directoryLinks.map((item) => (
                  <li key={item.href}>
                    <HoverMark label="Navigate" className="px-1 py-1">
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground/60">[{item.code}]</span>
                            <span className="group-hover:underline">{item.label}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">{item.path}</span>
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground/60">[{item.code}]</span>
                            <span className="group-hover:underline">{item.label}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">{item.path}</span>
                        </Link>
                      )}
                    </HoverMark>
                  </li>
                ))}
              </ul>
            </FrameGridCell>

            {/* CELL 4: NETWORK & TELEMETRY */}
            <FrameGridCell label="// 04: CONNECT" className="sm:border-b-0 p-5">
              <div className="space-y-4">
                <ul className="-mx-1 space-y-1 font-mono text-xs">
                  {links.map((link) => (
                    <li key={link.href}>
                      <HoverMark label="Connect" className="px-1 py-1">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="inline-flex items-center gap-2">
                            {link.icon}
                            <span>{link.label}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">{link.handle}</span>
                        </a>
                      </HoverMark>
                    </li>
                  ))}
                </ul>

                <div className="border border-border/80 bg-muted/20 p-2.5 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>PLATFORM</span>
                    <span className="text-foreground font-semibold">NEXT.JS 15 // DRIZZLE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>DATABASE</span>
                    <span className="text-foreground font-semibold">POSTGRESQL // EDGE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>AVAILABILITY</span>
                    <span className="text-foreground font-semibold">99.98% UPTIME</span>
                  </div>
                </div>
              </div>
            </FrameGridCell>
          </FrameGrid>

          {/* SUB-FOOTER SYSTEM BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5 font-mono text-[11px] text-muted-foreground bg-muted/10">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} HARSHHAA REDDY. ALL RIGHTS RESERVED.</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/privacy"
                data-hover-label="Open"
                className="hover-hatch px-1 py-0.5 hover:text-foreground transition-colors underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              <span className="text-border">•</span>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                data-hover-label="Open"
                className="hover-hatch px-1 py-0.5 hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <RssIcon className="size-3 text-foreground" />
                RSS
              </a>
              <span className="text-border">•</span>
              <button
                type="button"
                onClick={scrollToTop}
                data-hover-label="Top"
                className="hover-hatch inline-flex items-center gap-1 px-1 py-0.5 text-foreground hover:underline cursor-pointer"
              >
                <span>TOP</span>
                <ArrowUp className="size-3" />
              </button>
            </div>
          </div>
        </Frame>
      </div>
    </footer>
  )
}

export default Footer
