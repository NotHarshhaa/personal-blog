'use client'

import { Cloud, Cpu, Layers, Sparkles, Terminal, Wrench } from 'lucide-react'
import { useState } from 'react'

import { Frame, StripHeader } from '@/components/frame'
import { cn } from '@/utils'

type Category = 'All' | 'DevOps & Cloud' | 'AI & LLMOps' | 'Backend & Systems' | 'Architecture'

interface TechItem {
  name: string
  category: Category
  tag: string
  proficiency: string
}

const CATEGORIES: Category[] = [
  'All',
  'DevOps & Cloud',
  'AI & LLMOps',
  'Backend & Systems',
  'Architecture'
]

const TECH_ITEMS: TechItem[] = [
  // DevOps & Cloud
  { name: 'Kubernetes (K8s)', category: 'DevOps & Cloud', tag: 'Core', proficiency: 'Production' },
  { name: 'Terraform (IaC)', category: 'DevOps & Cloud', tag: 'GitOps', proficiency: 'Advanced' },
  {
    name: 'Docker & Podman',
    category: 'DevOps & Cloud',
    tag: 'Containers',
    proficiency: 'Production'
  },
  { name: 'AWS & EKS', category: 'DevOps & Cloud', tag: 'Cloud', proficiency: 'Production' },
  { name: 'ArgoCD & Flux', category: 'DevOps & Cloud', tag: 'GitOps', proficiency: 'Advanced' },
  {
    name: 'Cilium & eBPF',
    category: 'DevOps & Cloud',
    tag: 'Networking',
    proficiency: 'Intermediate'
  },
  {
    name: 'Prometheus & Grafana',
    category: 'DevOps & Cloud',
    tag: 'Observability',
    proficiency: 'Production'
  },
  {
    name: 'Linux Kernel & Systemd',
    category: 'DevOps & Cloud',
    tag: 'OS',
    proficiency: 'Advanced'
  },

  // AI & LLMOps
  { name: 'vLLM Engine', category: 'AI & LLMOps', tag: 'Inference', proficiency: 'Production' },
  {
    name: 'Triton Inference Server',
    category: 'AI & LLMOps',
    tag: 'Serving',
    proficiency: 'Advanced'
  },
  {
    name: 'PagedAttention / MLOps',
    category: 'AI & LLMOps',
    tag: 'LLMOps',
    proficiency: 'Production'
  },
  {
    name: 'PyTorch Distributed',
    category: 'AI & LLMOps',
    tag: 'Framework',
    proficiency: 'Intermediate'
  },
  {
    name: 'HuggingFace Ecosystem',
    category: 'AI & LLMOps',
    tag: 'Models',
    proficiency: 'Advanced'
  },
  {
    name: 'Quantization (AWQ/FP8)',
    category: 'AI & LLMOps',
    tag: 'Optimization',
    proficiency: 'Intermediate'
  },
  {
    name: 'GPU Clusters (NCCL)',
    category: 'AI & LLMOps',
    tag: 'Hardware',
    proficiency: 'Advanced'
  },

  // Backend & Systems
  { name: 'Go (Golang)', category: 'Backend & Systems', tag: 'Systems', proficiency: 'Advanced' },
  { name: 'Python', category: 'Backend & Systems', tag: 'Scripting', proficiency: 'Production' },
  {
    name: 'Bash & Shell scripting',
    category: 'Backend & Systems',
    tag: 'Automation',
    proficiency: 'Production'
  },
  {
    name: 'PostgreSQL & Drizzle',
    category: 'Backend & Systems',
    tag: 'Data',
    proficiency: 'Production'
  },
  {
    name: 'Redis Cache & Queues',
    category: 'Backend & Systems',
    tag: 'In-Memory',
    proficiency: 'Advanced'
  },
  {
    name: 'gRPC & Protocol Buffers',
    category: 'Backend & Systems',
    tag: 'RPC',
    proficiency: 'Intermediate'
  },
  {
    name: 'TypeScript / Next.js',
    category: 'Backend & Systems',
    tag: 'Fullstack',
    proficiency: 'Advanced'
  },

  // Architecture
  {
    name: 'Zero-Downtime Blue/Green',
    category: 'Architecture',
    tag: 'Deployment',
    proficiency: 'Production'
  },
  {
    name: 'SLO / SLA Engineering',
    category: 'Architecture',
    tag: 'Reliability',
    proficiency: 'Production'
  },
  {
    name: 'Distributed Consensus',
    category: 'Architecture',
    tag: 'Systems',
    proficiency: 'Advanced'
  },
  {
    name: 'Zero-Trust Security',
    category: 'Architecture',
    tag: 'InfraSec',
    proficiency: 'Advanced'
  }
]

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  All: Layers,
  'DevOps & Cloud': Cloud,
  'AI & LLMOps': Sparkles,
  'Backend & Systems': Terminal,
  Architecture: Cpu
}

const PROFICIENCY_LEVEL: Record<TechItem['proficiency'], number> = {
  Production: 3,
  Advanced: 2,
  Intermediate: 1
}

export const TechStack = ({ className }: { className?: string }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filteredItems =
    activeCategory === 'All'
      ? TECH_ITEMS
      : TECH_ITEMS.filter((item) => item.category === activeCategory)

  return (
    <Frame aria-label='Technical stack and systems expertise' className={cn('w-full', className)}>
      <StripHeader
        left={
          <>
            <Wrench className='text-foreground size-3' aria-hidden />
            <span className='text-foreground font-semibold'>
              Stack matrix // Architecture &amp; tooling
            </span>
          </>
        }
        right={<span>{filteredItems.length} technologies indexed</span>}
      />

      <div className='space-y-5 p-4 sm:p-6'>
        {/* Category Tabs */}
        <div className='border-border flex flex-wrap gap-1.5 border-b pb-4'>
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            const isSelected = activeCategory === cat
            const count =
              cat === 'All'
                ? TECH_ITEMS.length
                : TECH_ITEMS.filter((t) => t.category === cat).length

            return (
              <button
                key={cat}
                type='button'
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 font-mono text-xs tracking-wider uppercase transition-all duration-150',
                  isSelected
                    ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                )}
                aria-pressed={isSelected}
              >
                <Icon className='size-3' />
                <span>{cat}</span>
                <span
                  className={cn(
                    'text-[10px]',
                    isSelected ? 'text-background/80' : 'text-muted-foreground/60'
                  )}
                >
                  [{count}]
                </span>
              </button>
            )
          })}
        </div>

        {/* Grid of Tech Pills */}
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4'>
          {filteredItems.map((tech) => {
            const level = PROFICIENCY_LEVEL[tech.proficiency] ?? 0

            return (
              <div
                key={tech.name}
                className='hover-fill group border-border/80 bg-background/80 hover:border-foreground hover:bg-muted/30 flex items-center justify-between border px-3 py-2 transition-all duration-150'
                title={`${tech.name} — ${tech.proficiency} proficiency`}
              >
                <div className='min-w-0 pr-2'>
                  <p className='font-heading text-foreground truncate text-xs font-medium'>
                    {tech.name}
                  </p>
                  <p className='text-muted-foreground/60 font-mono text-[9px] tracking-wider uppercase'>
                    {tech.category}
                  </p>
                </div>

                <div className='flex shrink-0 flex-col items-end gap-1'>
                  <span className='border-border/60 bg-muted/40 text-muted-foreground border px-1.5 py-0.5 font-mono text-[9px] uppercase'>
                    {tech.tag}
                  </span>
                  <div aria-hidden className='flex items-center gap-0.5'>
                    {[1, 2, 3].map((dot) => (
                      <span
                        key={dot}
                        className={cn(
                          'border-muted-foreground/40 size-1 border',
                          dot <= level && 'border-foreground bg-foreground'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Frame>
  )
}

export default TechStack
