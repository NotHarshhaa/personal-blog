'use client'

import {
  Cloud,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  Wrench
} from 'lucide-react'
import { useState } from 'react'

import { Frame, FrameHeader } from '@/components/frame'
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
  { name: 'Docker & Podman', category: 'DevOps & Cloud', tag: 'Containers', proficiency: 'Production' },
  { name: 'AWS & EKS', category: 'DevOps & Cloud', tag: 'Cloud', proficiency: 'Production' },
  { name: 'ArgoCD & Flux', category: 'DevOps & Cloud', tag: 'GitOps', proficiency: 'Advanced' },
  { name: 'Cilium & eBPF', category: 'DevOps & Cloud', tag: 'Networking', proficiency: 'Intermediate' },
  { name: 'Prometheus & Grafana', category: 'DevOps & Cloud', tag: 'Observability', proficiency: 'Production' },
  { name: 'Linux Kernel & Systemd', category: 'DevOps & Cloud', tag: 'OS', proficiency: 'Advanced' },

  // AI & LLMOps
  { name: 'vLLM Engine', category: 'AI & LLMOps', tag: 'Inference', proficiency: 'Production' },
  { name: 'Triton Inference Server', category: 'AI & LLMOps', tag: 'Serving', proficiency: 'Advanced' },
  { name: 'PagedAttention / MLOps', category: 'AI & LLMOps', tag: 'LLMOps', proficiency: 'Production' },
  { name: 'PyTorch Distributed', category: 'AI & LLMOps', tag: 'Framework', proficiency: 'Intermediate' },
  { name: 'HuggingFace Ecosystem', category: 'AI & LLMOps', tag: 'Models', proficiency: 'Advanced' },
  { name: 'Quantization (AWQ/FP8)', category: 'AI & LLMOps', tag: 'Optimization', proficiency: 'Intermediate' },
  { name: 'GPU Clusters (NCCL)', category: 'AI & LLMOps', tag: 'Hardware', proficiency: 'Advanced' },

  // Backend & Systems
  { name: 'Go (Golang)', category: 'Backend & Systems', tag: 'Systems', proficiency: 'Advanced' },
  { name: 'Python', category: 'Backend & Systems', tag: 'Scripting', proficiency: 'Production' },
  { name: 'Bash & Shell scripting', category: 'Backend & Systems', tag: 'Automation', proficiency: 'Production' },
  { name: 'PostgreSQL & Drizzle', category: 'Backend & Systems', tag: 'Data', proficiency: 'Production' },
  { name: 'Redis Cache & Queues', category: 'Backend & Systems', tag: 'In-Memory', proficiency: 'Advanced' },
  { name: 'gRPC & Protocol Buffers', category: 'Backend & Systems', tag: 'RPC', proficiency: 'Intermediate' },
  { name: 'TypeScript / Next.js', category: 'Backend & Systems', tag: 'Fullstack', proficiency: 'Advanced' },

  // Architecture
  { name: 'Zero-Downtime Blue/Green', category: 'Architecture', tag: 'Deployment', proficiency: 'Production' },
  { name: 'SLO / SLA Engineering', category: 'Architecture', tag: 'Reliability', proficiency: 'Production' },
  { name: 'Distributed Consensus', category: 'Architecture', tag: 'Systems', proficiency: 'Advanced' },
  { name: 'Zero-Trust Security', category: 'Architecture', tag: 'InfraSec', proficiency: 'Advanced' }
]

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  All: Layers,
  'DevOps & Cloud': Cloud,
  'AI & LLMOps': Sparkles,
  'Backend & Systems': Terminal,
  Architecture: Cpu
}

export const TechStack = ({ className }: { className?: string }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filteredItems = activeCategory === 'All'
    ? TECH_ITEMS
    : TECH_ITEMS.filter((item) => item.category === activeCategory)

  return (
    <Frame aria-label="Technical stack and systems expertise" className={cn('w-full', className)}>
      <FrameHeader label="STACK MATRIX // ARCHITECTURE & TOOLING">
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase">
          <Wrench className="size-3 text-foreground" />
          <span>{filteredItems.length} TECHNOLOGIES INDEXED</span>
        </div>
      </FrameHeader>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-border pb-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            const isSelected = activeCategory === cat
            const count = cat === 'All'
              ? TECH_ITEMS.length
              : TECH_ITEMS.filter((t) => t.category === cat).length

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer',
                  isSelected
                    ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                )}
                aria-pressed={isSelected}
              >
                <Icon className="size-3" />
                <span>{cat}</span>
                <span className={cn('text-[10px]', isSelected ? 'text-background/80' : 'text-muted-foreground/60')}>
                  [{count}]
                </span>
              </button>
            )
          })}
        </div>

        {/* Grid of Tech Pills */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((tech) => (
            <div
              key={tech.name}
              className="group flex items-center justify-between border border-border/80 bg-background/80 px-3 py-2 transition-all duration-150 hover:border-foreground hover:bg-muted/30"
            >
              <div className="min-w-0 pr-2">
                <p className="truncate font-heading text-xs font-medium text-foreground group-hover:text-foreground">
                  {tech.name}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  {tech.category}
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="border border-border/60 bg-muted/40 px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground uppercase">
                  {tech.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

export default TechStack
