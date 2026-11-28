import type { Metadata } from 'next'

import {
  CheckCircle2Icon,
  ClockIcon,
  CpuIcon,
  FileCode2Icon,
  LayersIcon,
  MailIcon,
  ShieldCheckIcon,
  TerminalIcon
} from 'lucide-react'
import Link from 'next/link'

import { Frame, FrameBody, FrameGrid, FrameGridCell, FrameHeader } from '@/components/frame'
import NewsletterCard from '@/components/newsletter-card'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'DevOps & AI Architecture Dispatch',
  description:
    'Bi-weekly technical engineering dispatch covering Kubernetes clustering, Terraform GitOps, distributed LLMOps, and production architecture.'
}

const TOPIC_PILLARS = [
  {
    code: '01',
    title: 'Kubernetes & Bare-Metal Orchestration',
    icon: <LayersIcon className='text-foreground size-4' />,
    description:
      'In-depth cluster topologies, Cilium eBPF service mesh, multi-tenant RBAC, and high-performance container runtimes for production workloads.',
    tags: ['Cilium', 'eBPF', 'K8s', 'Containerd']
  },
  {
    code: '02',
    title: 'Infrastructure as Code & GitOps',
    icon: <FileCode2Icon className='text-foreground size-4' />,
    description:
      'Enterprise Terraform and OpenTofu module architecture, zero-drift pipelines, policy-as-code, and automated multi-cluster GitOps with ArgoCD.',
    tags: ['Terraform', 'OpenTofu', 'ArgoCD', 'GitOps']
  },
  {
    code: '03',
    title: 'Distributed LLMOps & AI Infrastructure',
    icon: <CpuIcon className='text-foreground size-4' />,
    description:
      'High-throughput model serving with vLLM, speculative decoding, KV-cache quantization, TensorRT-LLM, and distributed training cluster setups.',
    tags: ['vLLM', 'Triton', 'GPU Clusters', 'Quantization']
  },
  {
    code: '04',
    title: 'Production SRE & Outage Post-Mortems',
    icon: <TerminalIcon className='text-foreground size-4' />,
    description:
      'Raw technical analysis of real-world infrastructure failures, cascading network outages, high-cardinality telemetry, and zero-downtime migrations.',
    tags: ['SRE', 'Post-Mortems', 'Prometheus', 'Resilience']
  }
]

const SAMPLE_ISSUES = [
  {
    edition: 'EDITION #24',
    date: 'LATEST ISSUE',
    title: 'Designing Multi-Region Active-Active Kubernetes with Cilium ClusterMesh',
    readTime: '12 min read',
    category: 'NETWORKING',
    summary:
      'How to connect isolated VPCs across AWS and GCP using eBPF wireguard routing, global service load balancing, and resilient cross-region state sync.'
  },
  {
    edition: 'EDITION #23',
    date: 'PREVIOUS ISSUE',
    title: 'High-Throughput LLM Serving: Benchmarking vLLM vs. TensorRT-LLM on H100s',
    readTime: '15 min read',
    category: 'LLMOPS',
    summary:
      'Practical throughput vs. time-to-first-token (TTFT) trade-offs, continuous batching efficiency, PagedAttention cache layout, and FP8 quantization numbers.'
  },
  {
    edition: 'EDITION #22',
    date: 'ARCHIVE',
    title: 'Zero-Downtime Database Schema Migrations: The Expand-Contract Playbook',
    readTime: '9 min read',
    category: 'DATABASE',
    summary:
      'How to alter high-concurrency PostgreSQL tables with billions of rows without lock contention or downtime using dual-writes and ghost tables.'
  }
]

const GUARANTEES = [
  {
    title: 'Strictly Technical Notes',
    description:
      'No marketing fluff, sponsored placement junk, or generic listicles. Every issue contains real configuration, code, and system diagrams.'
  },
  {
    title: 'Bi-Weekly Cadence',
    description:
      'Delivered directly to your inbox every second Tuesday at 09:00 UTC. Never excessive emails or sudden spam blasts.'
  },
  {
    title: 'Zero Tracker Lock-in',
    description:
      'No creepy cross-site ad trackers or telemetry beacons. One-click unsubscribe link included in the header and footer of every single email.'
  }
]

const NewsletterPage = async () => {
  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'

  return (
    <div className='relative z-10 w-full space-y-8 sm:space-y-10'>
      {/* Admin Action Bar */}
      {isAdmin && (
        <div className='border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 border p-3 font-mono text-xs'>
          <div className='flex items-center gap-2'>
            <span className='bg-foreground size-2' />
            <span className='text-foreground font-semibold uppercase'>
              Admin Publishing Pipeline Active
            </span>
          </div>
          <Link
            href='/admin'
            className='border-border bg-background text-foreground hover:border-foreground inline-flex items-center gap-1 border px-2.5 py-1 transition-colors'
          >
            <span>Open Delivery Dispatcher ↘</span>
          </Link>
        </div>
      )}

      {/* HEADER HERO */}
      <Frame as='header'>
        <FrameHeader label='PUBLICATION // DISPATCH ARCHIVE'>
          <div className='text-muted-foreground flex items-center gap-2 font-mono text-[10px]'>
            <span className='border-border bg-muted/40 inline-flex items-center gap-1.5 border px-2 py-0.5'>
              <span className='bg-success size-1.5 animate-pulse rounded-full' />
              <span>FREQ: BI-WEEKLY</span>
            </span>
            <span className='text-border hidden sm:inline'>|</span>
            <span className='hidden sm:inline'>FORMAT: BLUEPRINTS</span>
          </div>
        </FrameHeader>
        <FrameBody className='space-y-4'>
          <div className='space-y-2'>
            <div className='text-muted-foreground inline-flex items-center gap-2 font-mono text-xs'>
              <MailIcon className='text-foreground size-3.5' />
              <span>ENGINEERING WRITINGS BY HARSHHAA</span>
            </div>
            <h1 className='text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
              DevOps, Cloud & AI Architecture Dispatch
            </h1>
            <p className='text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base'>
              Join engineers and systems architects receiving bi-weekly deep dives on Kubernetes
              clustering, Terraform GitOps pipelines, distributed ML infrastructure, and low-latency
              LLMOps.
            </p>
          </div>

          <div className='text-muted-foreground flex flex-wrap items-center gap-3 pt-2 font-mono text-xs'>
            <span className='border-border bg-background border px-2.5 py-1'>
              ✓ 100% PRODUCTION NOTES
            </span>
            <span className='border-border bg-background border px-2.5 py-1'>
              ✓ REAL ARCHITECTURAL DIAGRAMS
            </span>
            <span className='border-border bg-background border px-2.5 py-1'>
              ✓ NO SPONSORED ADS
            </span>
          </div>
        </FrameBody>
      </Frame>

      {/* SUBSCRIBE TERMINAL */}
      <NewsletterCard />

      {/* CORE TOPIC PILLARS */}
      <section aria-labelledby='pillars-heading' className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2
            id='pillars-heading'
            className='text-muted-foreground font-mono text-xs font-bold tracking-widest uppercase'
          >
            {'//'} WHAT EVERY DISPATCH COVERS
          </h2>
          <span className='text-muted-foreground font-mono text-[11px]'>4 CORE DOMAINS</span>
        </div>

        <Frame>
          <FrameHeader label='CURRICULUM SPECIFICATION' />
          <FrameGrid className='border-t-0'>
            {TOPIC_PILLARS.map((pillar, idx) => (
              <FrameGridCell
                key={pillar.code}
                label={`// 0${idx + 1}: ${pillar.title.toUpperCase()}`}
                className='p-5'
              >
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    {pillar.icon}
                    <h3 className='text-foreground text-sm font-semibold'>{pillar.title}</h3>
                  </div>
                  <p className='text-muted-foreground text-xs leading-relaxed'>
                    {pillar.description}
                  </p>
                  <div className='flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]'>
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className='border-border/80 bg-muted/40 text-muted-foreground border px-1.5 py-0.5'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FrameGridCell>
            ))}
          </FrameGrid>
        </Frame>
      </section>

      {/* SAMPLE DISPATCH PREVIEWS */}
      <section aria-labelledby='sample-issues-heading' className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2
            id='sample-issues-heading'
            className='text-muted-foreground font-mono text-xs font-bold tracking-widest uppercase'
          >
            {'//'} RECENT DISPATCH SAMPLE EDITIONS
          </h2>
          <span className='text-muted-foreground font-mono text-[11px]'>DEEP-DIVES</span>
        </div>

        <div className='grid gap-4 sm:grid-cols-3'>
          {SAMPLE_ISSUES.map((issue) => (
            <Frame key={issue.edition} className='flex flex-col justify-between'>
              <FrameHeader label={issue.edition}>
                <span className='text-muted-foreground font-mono text-[10px]'>
                  {issue.category}
                </span>
              </FrameHeader>
              <FrameBody className='flex flex-1 flex-col justify-between space-y-3'>
                <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center gap-2 font-mono text-[10px]'>
                    <ClockIcon className='size-3' />
                    <span>{issue.readTime}</span>
                    <span>•</span>
                    <span>{issue.date}</span>
                  </div>
                  <h3 className='text-foreground text-sm leading-snug font-bold tracking-tight'>
                    {issue.title}
                  </h3>
                  <p className='text-muted-foreground text-xs leading-relaxed'>{issue.summary}</p>
                </div>
                <div className='border-border/60 border-t pt-2'>
                  <span className='text-muted-foreground flex items-center gap-1 font-mono text-[10px]'>
                    <CheckCircle2Icon className='text-foreground size-3' />
                    <span>SENT TO ALL ACTIVE SUBSCRIBERS</span>
                  </span>
                </div>
              </FrameBody>
            </Frame>
          ))}
        </div>
      </section>

      {/* PUBLICATION PROTOCOL & GUARANTEES */}
      <section aria-labelledby='protocol-heading'>
        <Frame>
          <FrameHeader label='EDITORIAL PROTOCOL & PRIVACY SPEC' />
          <FrameBody className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-3'>
              {GUARANTEES.map((item) => (
                <div
                  key={item.title}
                  className='border-border/70 bg-muted/20 space-y-1.5 border p-4'
                >
                  <div className='flex items-center gap-2'>
                    <ShieldCheckIcon className='text-foreground size-4' />
                    <h3 className='text-foreground font-mono text-xs font-bold tracking-wider uppercase'>
                      {item.title}
                    </h3>
                  </div>
                  <p className='text-muted-foreground text-xs leading-relaxed'>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className='border-border text-muted-foreground flex flex-col items-center justify-between gap-3 border-t pt-4 font-mono text-xs sm:flex-row'>
              <span>Have an architecture challenge or topic request?</span>
              <a
                href='https://t.me/prodevopsguy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-foreground inline-flex items-center gap-1.5 hover:underline'
              >
                <span>Ping on Telegram [@prodevopsguy]</span>
                <span>→</span>
              </a>
            </div>
          </FrameBody>
        </Frame>
      </section>
    </div>
  )
}

export default NewsletterPage
