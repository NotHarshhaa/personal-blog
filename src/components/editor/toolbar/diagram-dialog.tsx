'use client'

import type { Editor } from '@tiptap/react'

import { CheckIcon, LayersIcon } from 'lucide-react'
import { useState } from 'react'

import { DEFAULT_DIAGRAM_TEMPLATE } from '@/components/editor/diagram-node-view'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { ToolbarButton } from './toolbar-button'

type DiagramDialogProps = {
  editor: Editor
}

const TEMPLATES = [
  {
    name: 'K8s Cluster',
    caption: 'Kubernetes Cluster & Ingress Topology',
    code: DEFAULT_DIAGRAM_TEMPLATE
  },
  {
    name: 'GitOps Pipeline',
    caption: 'GitOps Continuous Delivery Flow',
    code: `flowchart LR
    Dev([Engineer]) -->|git push| Repo[GitHub Repo]
    Repo -->|CI trigger| Runner[Build & Test Action]
    Runner -->|publish| Registry[(OCI Image Registry)]
    Registry -.->|watch| ArgoCD[ArgoCD Controller]
    ArgoCD -->|reconcile| Production[Production Cluster]`
  },
  {
    name: 'VPC & Multi-AZ',
    caption: 'AWS High-Availability Multi-AZ VPC',
    code: `flowchart TB
    User([End User]) --> CF[CloudFront CDN]
    CF --> ALB[Application Load Balancer]
    
    subgraph VPC ["AWS VPC 10.0.0.0/16"]
      ALB --> WebA[EC2 / Pod: AZ-1a]
      ALB --> WebB[EC2 / Pod: AZ-1b]
      WebA --> RDS[(RDS PostgreSQL Primary)]
      WebB --> RDS
    end`
  }
]

export const DiagramDialog = ({ editor }: DiagramDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState(DEFAULT_DIAGRAM_TEMPLATE)
  const [caption, setCaption] = useState('Production Architecture Topology')

  const handleOpen = (open: boolean) => {
    if (open) {
      setCode(DEFAULT_DIAGRAM_TEMPLATE)
      setCaption('Production Architecture Topology')
    }
    setIsOpen(open)
  }

  const handleInsert = () => {
    const trimmed = code.trim()
    if (!trimmed) return

    editor.chain().focus().setDiagram({ code: trimmed, caption }).run()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip="Insert Architecture Blueprint (Mermaid)"
          shortcut="$$mermaid"
          icon={<LayersIcon className="size-4" />}
        />
      </DialogTrigger>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto min-w-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayersIcon className="size-5" />
            <span>Insert Architecture Blueprint</span>
          </DialogTitle>
          <DialogDescription>
            Create monochromatic 0px-radius SVG system topologies with pan & zoom controls.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 min-w-0 w-full">
          {/* Preset Architecture Templates */}
          <div className="space-y-1.5 min-w-0 w-full">
            <span className="text-xs font-medium text-muted-foreground">
              Systems Engineering Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setCode(item.code)
                    setCaption(item.caption)
                  }}
                  className="border border-border bg-muted/40 hover:bg-muted hover:border-foreground/50 px-2.5 py-1 text-xs font-mono text-foreground transition-colors cursor-pointer"
                >
                  +{item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Diagram Definition */}
          <div className="space-y-1.5 min-w-0 w-full">
            <Label htmlFor="diagram-code" className="text-xs font-medium">
              Mermaid Diagram Code
            </Label>
            <Textarea
              id="diagram-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="flowchart LR&#10;    A[Gateway] --> B[Service]"
              rows={8}
              className="font-mono text-xs w-full min-w-0"
            />
          </div>

          {/* Blueprint Caption */}
          <div className="space-y-1.5 min-w-0 w-full">
            <Label htmlFor="diagram-caption" className="text-xs font-medium">
              Figure Caption / Title (Optional)
            </Label>
            <Input
              id="diagram-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Multi-Tenant EKS Cluster Topology"
              className="font-mono text-xs w-full min-w-0"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            disabled={!code.trim()}
            className="gap-1.5"
          >
            <CheckIcon className="size-4" />
            <span>Insert Blueprint</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DiagramDialog
