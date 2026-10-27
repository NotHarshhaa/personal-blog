'use client'

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  LayersIcon,
  Maximize2Icon,
  Minimize2Icon,
  MoveIcon,
  RotateCcwIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'

import { CornerBrackets } from '@/components/frame'
import { cn } from '@/lib/utils'

export const DEFAULT_DIAGRAM_TEMPLATE = `flowchart LR
    Client([Client / Browser]) --> WAF[Cloudflare / AWS WAF]
    WAF --> Ingress[Traefik / NGINX Ingress]
    
    subgraph K8S ["Kubernetes Cluster (0px Radius)"]
        direction TB
        Ingress --> APIGateway[API Gateway]
        APIGateway --> AuthSvc[Auth Service]
        APIGateway --> CoreAPI[Core Service]
        CoreAPI --> Cache[(Redis Cache)]
    end
    
    CoreAPI --> DB[(PostgreSQL + pgvector)]
    CoreAPI --> S3[(Object Store)]`

const ARCHITECTURE_TEMPLATES = [
  {
    label: 'K8s Microservices',
    code: DEFAULT_DIAGRAM_TEMPLATE
  },
  {
    label: 'GitOps CI/CD Pipeline',
    code: `flowchart LR
    Dev[Developer] -->|git push| GitHub[GitHub Repo]
    GitHub -->|webhook| Actions[GitHub Actions Runner]
    Actions -->|build & test| Registry[OCI Registry]
    Registry -.->|image digest| ArgoCD[ArgoCD Controller]
    ArgoCD -->|sync| Cluster[EKS / GKE Production]`
  },
  {
    label: 'Cloud VPC & Transit Gateway',
    code: `flowchart TB
    Internet((Public Internet)) --> IGW[Internet Gateway]
    IGW --> PublicSubnet[Public Subnet: NAT Gateway]
    
    subgraph VPC ["AWS VPC (10.0.0.0/16)"]
        PublicSubnet --> TGW[Transit Gateway]
        TGW --> PrivateA[Private Subnet 1a: App]
        TGW --> PrivateB[Private Subnet 1b: DB]
    end`
  }
]

export const DiagramNodeView = ({ node, updateAttributes, editor }: ReactNodeViewProps) => {
  const rawCode = (node.attrs.code as string) || DEFAULT_DIAGRAM_TEMPLATE
  const caption = (node.attrs.caption as string) || ''

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [svgHtml, setSvgHtml] = useState<string>('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedSvg, setCopiedSvg] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>(
    editor.isEditable ? 'code' : 'preview'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Pan and zoom states
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const viewportRef = useRef<HTMLDivElement>(null)

  const reactId = useId().replaceAll(':', '_')
  const diagramId = `mermaid_diag_${reactId}`
  const textareaId = `mermaid_input_${reactId}`
  const captionInputId = `mermaid_caption_${reactId}`

  // Render SVG using Mermaid with strict OKLCH monochromatic blueprint styles
  const renderDiagram = useCallback(
    async (codeToRender: string) => {
      try {
        const mermaidModule = await import('mermaid')
        const mermaid = mermaidModule.default

        // Theme-tuned base palette for OKLCH monochromatic aesthetic
        const lightColors = {
          background: 'transparent',
          primaryColor: 'oklch(0.985 0.006 92)',
          primaryTextColor: 'oklch(0.12 0 0)',
          primaryBorderColor: 'oklch(0.12 0 0)',
          lineColor: 'oklch(0.12 0 0)',
          secondaryColor: 'oklch(0.92 0.008 92)',
          tertiaryColor: 'oklch(0.965 0.012 92)',
          mainBkg: 'oklch(0.985 0.006 92)',
          nodeBorder: 'oklch(0.12 0 0)',
          clusterBkg: 'oklch(0.94 0.008 92)',
          clusterBorder: 'oklch(0.12 0 0)',
          edgeLabelBackground: 'oklch(0.965 0.012 92)',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '12px'
        }

        const darkColors = {
          background: 'transparent',
          primaryColor: 'oklch(0.10 0 0)',
          primaryTextColor: 'oklch(0.98 0 0)',
          primaryBorderColor: 'oklch(1 0 0 / 28%)',
          lineColor: 'oklch(0.98 0 0 / 75%)',
          secondaryColor: 'oklch(0.14 0 0)',
          tertiaryColor: 'oklch(0.08 0 0)',
          mainBkg: 'oklch(0.10 0 0)',
          nodeBorder: 'oklch(1 0 0 / 28%)',
          clusterBkg: 'oklch(0.08 0 0)',
          clusterBorder: 'oklch(1 0 0 / 22%)',
          edgeLabelBackground: 'oklch(0.10 0 0)',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '12px'
        }

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables: isDark ? darkColors : lightColors
        })

        const renderContainerId = `${diagramId}_render`
        const { svg } = await mermaid.render(renderContainerId, codeToRender)

        // Enforce brutalist 0px radius by stripping/replacing all rx and ry attributes on rect elements
        const zeroRadiusSvg = svg
          .replaceAll(/\brx="[^"]*"/g, 'rx="0"')
          .replaceAll(/\bry="[^"]*"/g, 'ry="0"')
          // Inject blueprint SVG CSS overrides for crisp lines and monospace text
          .replace(
            /<\/svg>/,
            `<style>
              rect, polygon, circle, path { rx: 0 !important; ry: 0 !important; }
              .label, .nodeLabel { font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important; font-size: 11px !important; letter-spacing: 0.02em !important; }
              .cluster-label { font-family: ui-monospace, monospace !important; font-size: 10px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; }
              .edgeLabel { font-family: ui-monospace, monospace !important; font-size: 10px !important; }
            </style></svg>`
          )

        setSvgHtml(zeroRadiusSvg)
        setRenderError(null)
      } catch (error) {
        setRenderError(
          error instanceof Error ? error.message : 'Syntax error in architecture diagram definition'
        )
      }
    },
    [isDark, diagramId]
  )

  useEffect(() => {
    void renderDiagram(rawCode)
  }, [rawCode, renderDiagram])

  // Pan drag handling via event listeners to allow dragging smoothly across the entire window
  useEffect(() => {
    const el = viewportRef.current
    if (!el || activeTab !== 'preview') return

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    el.addEventListener('mousedown', handleMouseDown)
    globalThis.window.addEventListener('mousemove', handleMouseMove)
    globalThis.window.addEventListener('mouseup', handleMouseUp)

    return () => {
      el.removeEventListener('mousedown', handleMouseDown)
      globalThis.window.removeEventListener('mousemove', handleMouseMove)
      globalThis.window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeTab, isDragging, pan.x, pan.y])

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(3, Math.round((s + 0.25) * 100) / 100))
  const zoomOut = () => setScale((s) => Math.max(0.4, Math.round((s - 0.25) * 100) / 100))
  const resetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const handleCopyCode = () => {
    void globalThis.navigator.clipboard.writeText(rawCode)
    setCopiedCode(true)
    toast.success('Mermaid definition copied to clipboard')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopySvg = () => {
    if (!svgHtml) return
    void globalThis.navigator.clipboard.writeText(svgHtml)
    setCopiedSvg(true)
    toast.success('Clean SVG copied to clipboard')
    setTimeout(() => setCopiedSvg(false), 2000)
  }

  return (
    <NodeViewWrapper
      className={cn(
        'not-prose border-border bg-card my-6 w-full border font-mono transition-all',
        isFullscreen &&
          'fixed inset-4 z-50 my-0 max-h-[calc(100vh-2rem)] overflow-hidden shadow-2xl'
      )}
    >
      <CornerBrackets />

      {/* Blueprint Header */}
      <div className='border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2 select-none sm:px-4'>
        <div className='flex items-center gap-2'>
          <LayersIcon className='text-foreground size-3.5' />
          <span className='text-foreground text-[11px] font-semibold tracking-wider uppercase'>
            Architecture Blueprint // System Topology
          </span>
          {caption && (
            <span className='border-border bg-background py-0.2 text-muted-foreground hidden border px-1.5 text-[9px] sm:inline'>
              {caption}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className='flex items-center gap-1 text-[11px]'>
          {editor.isEditable && (
            <div className='border-border bg-background mr-2 flex items-center border'>
              <button
                type='button'
                onClick={() => setActiveTab('code')}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] transition-colors',
                  activeTab === 'code'
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <CodeIcon className='size-2.5' />
                <span>Code</span>
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('preview')}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] transition-colors',
                  activeTab === 'preview'
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <EyeIcon className='size-2.5' />
                <span>Preview</span>
              </button>
            </div>
          )}

          {/* Pan & Zoom Controls */}
          {activeTab === 'preview' && (
            <>
              <button
                type='button'
                onClick={zoomOut}
                title='Zoom Out (-25%)'
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground border p-1 transition-colors'
              >
                <ZoomOutIcon className='size-3' />
              </button>
              <span className='text-muted-foreground min-w-10 text-center text-[10px] font-medium'>
                {Math.round(scale * 100)}%
              </span>
              <button
                type='button'
                onClick={zoomIn}
                title='Zoom In (+25%)'
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground border p-1 transition-colors'
              >
                <ZoomInIcon className='size-3' />
              </button>
              <button
                type='button'
                onClick={resetView}
                title='Reset Pan & Zoom (1:1)'
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground border p-1 transition-colors'
              >
                <RotateCcwIcon className='size-3' />
              </button>
            </>
          )}

          <button
            type='button'
            onClick={handleCopyCode}
            title='Copy Mermaid Code'
            className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground border p-1 transition-colors'
          >
            {copiedCode ? (
              <CheckIcon className='text-foreground size-3' />
            ) : (
              <CopyIcon className='size-3' />
            )}
          </button>

          <button
            type='button'
            onClick={handleCopySvg}
            title='Copy Clean SVG'
            className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground hidden items-center gap-1 border px-1.5 py-0.5 text-[10px] transition-colors sm:inline-flex'
          >
            {copiedSvg ? <CheckIcon className='text-foreground size-2.5' /> : null}
            <span>SVG</span>
          </button>

          <button
            type='button'
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground border p-1 transition-colors'
          >
            {isFullscreen ? (
              <Minimize2Icon className='size-3' />
            ) : (
              <Maximize2Icon className='size-3' />
            )}
          </button>
        </div>
      </div>

      {/* Editor Tab (Authoring Mode) */}
      {editor.isEditable && activeTab === 'code' && (
        <div className='space-y-3 p-3.5 sm:p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <label htmlFor={textareaId} className='text-muted-foreground text-[11px] font-medium'>
              Mermaid Diagram Code:
            </label>
            <div className='flex flex-wrap gap-1'>
              {ARCHITECTURE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type='button'
                  onClick={() => updateAttributes({ code: tmpl.code })}
                  className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground border px-2 py-0.5 text-[10px] transition-colors'
                >
                  +{tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id={textareaId}
            value={rawCode}
            onChange={(e) => updateAttributes({ code: e.target.value })}
            rows={8}
            className='border-border bg-background text-foreground focus:border-foreground w-full border p-2.5 font-mono text-xs focus:outline-none'
            placeholder='flowchart LR&#10;    A[Client] --> B[Server]'
          />

          <div className='flex items-center gap-2'>
            <label htmlFor={captionInputId} className='text-muted-foreground shrink-0 text-[11px]'>
              Caption:
            </label>
            <input
              id={captionInputId}
              type='text'
              value={caption}
              onChange={(e) => updateAttributes({ caption: e.target.value })}
              placeholder='e.g. Production Ingress & Event-Driven Topology'
              className='border-border bg-background text-foreground focus:border-foreground w-full border px-2.5 py-1 text-xs focus:outline-none'
            />
          </div>
        </div>
      )}

      {/* Interactive Blueprint Canvas Tab */}
      {activeTab === 'preview' && (
        <div className='bg-background/50 relative overflow-hidden'>
          {renderError ? (
            <div className='text-destructive p-4 font-mono text-xs'>
              <p className='font-semibold'>Blueprint Render Error:</p>
              <pre className='mt-1 whitespace-pre-wrap'>{renderError}</pre>
            </div>
          ) : (
            <div
              ref={viewportRef}
              className={cn(
                'relative flex min-h-[300px] w-full items-center justify-center overflow-hidden p-6 select-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
                isFullscreen ? 'h-[calc(100vh-8rem)]' : 'max-h-[560px]'
              )}
            >
              {/* Pan & Zoom Transformer Layer */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                className='pointer-events-none flex w-full max-w-full items-center justify-center'
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />

              {/* Floating pan instructions */}
              <div className='border-border/80 bg-background/90 text-muted-foreground pointer-events-none absolute right-2 bottom-2 flex items-center gap-1 border px-1.5 py-0.5 text-[9px] opacity-70'>
                <MoveIcon className='size-2.5' />
                <span>Drag to pan · + / - to zoom</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Caption */}
      {caption && (
        <div className='border-border bg-muted/20 text-muted-foreground border-t px-3 py-1.5 text-center font-mono text-[11px]'>
          FIG // {caption}
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default DiagramNodeView
