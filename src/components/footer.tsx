'use client'

import { SiGithub, SiInstagram, SiTelegram, SiX } from '@icons-pack/react-simple-icons'
import { useState } from 'react'
import { Button } from '@/components/ui'
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
}>

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const links: Links = [
    {
      href: 'https://t.me/prodevopsguy',
      icon: <SiTelegram className="size-4" />,
      label: 'Telegram'
    },
    {
      href: 'https://github.com/NotHarshhaa',
      icon: <SiGithub className="size-4" />,
      label: 'GitHub'
    },
    {
      href: 'https://www.instagram.com/harshhaareddy/',
      icon: <SiInstagram className="size-4" />,
      label: 'Instagram'
    },
    {
      href: 'https://x.com/NotHarshhaa',
      icon: <SiX className="size-4" />,
      label: 'X'
    }
  ]

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="relative z-10 mt-auto">
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <Frame>
          <FrameHeader label="Footer" />
          <FrameGrid className="border-t-0">
            <FrameGridCell label="About" className="border-b border-border sm:border-b sm:border-r">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Writing on DevOps, cloud, platform engineering, AI/ML, MLOps,
                LLMOps, GenAI, and AI infrastructure — tutorials and notes from
                Harshhaa.
              </p>
            </FrameGridCell>

            <FrameGridCell label="Stay updated" className="border-b border-border sm:border-b">
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-10 min-w-0 flex-1 border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  required
                />
                <Button type="submit" className="h-10 shrink-0">
                  Subscribe
                </Button>
              </form>
              {isSubscribed && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Thanks for subscribing.
                </p>
              )}
            </FrameGridCell>

            <FrameGridCell label="Connect" className="border-b border-border sm:border-r sm:border-b-0">
              <ul className="-mx-1 space-y-0.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <HoverMark label="Open link" className="px-1 py-1.5">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                      >
                        {link.icon}
                        {link.label}
                      </a>
                    </HoverMark>
                  </li>
                ))}
              </ul>
            </FrameGridCell>

            <FrameGridCell label="Site" className="sm:border-b-0">
              <ul className="-mx-1 space-y-0.5 text-sm text-muted-foreground">
                <li>
                  <HoverMark label="View" className="px-1 py-1.5">
                    <a
                      href="/privacy"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      Privacy Policy
                    </a>
                  </HoverMark>
                </li>
                <li>
                  <span>
                    © {new Date().getFullYear()} Harshhaa
                  </span>
                </li>
                <li>All rights reserved.</li>
              </ul>
            </FrameGridCell>
          </FrameGrid>
        </Frame>
      </div>
    </footer>
  )
}

export default Footer
