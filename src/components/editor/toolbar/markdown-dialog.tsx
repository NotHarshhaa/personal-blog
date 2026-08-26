import type { Editor } from '@tiptap/react'
import katex from 'katex'
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileCode2Icon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon
} from 'lucide-react'
import MarkdownIt from 'markdown-it'
import { useMemo, useRef, useState } from 'react'

import { toast } from '@/components/ui'
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
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { ToolbarButton } from './toolbar-button'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
})

function renderMarkdownWithMath(raw: string): string {
  // 1. Block equations: $$ ... $$
  const withBlockMath = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_match, latex: string) => {
    const trimmed = latex.trim()
    try {
      const rendered = katex.renderToString(trimmed, {
        displayMode: true,
        throwOnError: false
      })
      return `\n\n<div class="tiptap-math-block my-4 text-center overflow-x-auto">${rendered}</div>\n\n`
    } catch {
      return `\n\n<div class="text-destructive font-mono text-xs my-2">${trimmed}</div>\n\n`
    }
  })

  // 2. Inline equations: $ ... $
  const withAllMath = withBlockMath.replace(/(?<!\\|\$)\$([^$\n]+?)\$(?!\$)/g, (_match, latex: string) => {
    const trimmed = latex.trim()
    try {
      const rendered = katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false
      })
      return `<span class="tiptap-math inline-block mx-0.5">${rendered}</span>`
    } catch {
      return `<span class="text-destructive font-mono text-xs">${trimmed}</span>`
    }
  })

  return md.render(withAllMath)
}

function markdownToTipTapHtml(raw: string): string {
  // 1. Block equations: $$ ... $$ -> <div data-latex="..." data-display="true"></div>
  const withBlockMath = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_match, latex: string) => {
    const trimmed = latex.trim()
    const encoded = trimmed.replace(/"/g, '&quot;')
    return `\n\n<div data-latex="${encoded}" data-display="true"></div>\n\n`
  })

  // 2. Inline equations: $ ... $ -> <span data-latex="..." data-display="false"></span>
  const withAllMath = withBlockMath.replace(/(?<!\\|\$)\$([^$\n]+?)\$(?!\$)/g, (_match, latex: string) => {
    const trimmed = latex.trim()
    const encoded = trimmed.replace(/"/g, '&quot;')
    return `<span data-latex="${encoded}" data-display="false"></span>`
  })

  return md.render(withAllMath)
}

export type ExtractedMetadata = {
  title?: string
  description?: string
}

type MarkdownDialogProps = {
  editor: Editor
  onMetadataExtracted?: (meta: ExtractedMetadata) => void
}

const SAMPLE_TEMPLATES = [
  {
    name: 'Full Blog Post',
    content: `---
title: Building Next-Gen Web Applications
description: A complete guide to modern architecture and developer productivity.
---

# Building Next-Gen Web Applications

Modern web development moves at lightning speed. In this article, we explore essential principles and best practices for creating scalable, resilient systems.

## Key Architectural Principles

1. **Simplicity First**: Always start with the simplest architecture that satisfies your requirements.
2. **Type Safety**: End-to-end typing prevents runtime bugs and empowers confident refactoring.
3. **Observability**: Implement structured logging and metrics early.

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

### Interactive Code Example

\`\`\`typescript
interface UserProfile {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

export function formatUser(user: UserProfile): string {
  return \`[\${user.role.toUpperCase()}] \${user.name}\`
}
\`\`\`

## Feature Matrix

| Feature | Support | Performance |
| :--- | :---: | ---: |
| Server Components | ✅ Native | Sub-10ms |
| Markdown Parsing | ✅ Built-in | Instant |
| LaTeX Mathematics | ✅ KaTeX | Zero-latency |

### Upcoming Milestones
- [x] Integrate Markdown AST parser
- [x] Add LaTeX formula support
- [ ] Deploy global edge replication
`
  },
  {
    name: 'Technical Notes',
    content: `## Architecture Overview & Notes

Here is a quick snapshot of the system design:

\`\`\`bash
# Install dependencies
pnpm install

# Start local development server
pnpm run dev
\`\`\`

### System Constraints
- **Response latency**: < 50ms p95
- **Throughput**: 10k requests/sec
- **Memory footprint**: < 512MB per instance

> [!NOTE]
> Ensure all API endpoints validate payloads with strict schema definitions before processing.
`
  },
  {
    name: 'Math & Formulas',
    content: `## Mathematical Foundations

When analyzing throughput and capacity, we evaluate the baseline:

$$E = mc^2$$

### Parameter Calculation

$$\\text{Total Parameters} = \\sum_{l=1}^{L} \\left( W_l \\times H_l \\right) \\approx 54\\text{ GB}$$

We can also express fractions inline: $$\\frac{a + b}{c \\cdot d}$$ for quick calculations.
`
  }
]

function parseYaml(yamlBlock: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = yamlBlock.split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim()
      let val = line.slice(colonIdx + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      result[key] = val
    }
  }
  return result
}

function findFirstH1(body: string): string | undefined {
  for (const line of body.split('\n')) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('# ')) {
      return trimmedLine.slice(2).trim()
    }
  }
  return undefined
}

function parseMarkdownWithFrontmatter(raw: string): {
  frontmatter: Record<string, string>
  body: string
  detectedTitle?: string
  detectedDescription?: string
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
  const match = frontmatterRegex.exec(raw)

  if (match?.[1]) {
    const body = raw.slice(match[0].length)
    const frontmatter = parseYaml(match[1])
    return {
      frontmatter,
      body,
      detectedTitle: frontmatter.title ?? findFirstH1(body),
      detectedDescription: frontmatter.description
    }
  }

  return {
    frontmatter: {},
    body: raw,
    detectedTitle: findFirstH1(raw),
    detectedDescription: undefined
  }
}

export const MarkdownDialog = ({ editor, onMetadataExtracted }: MarkdownDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [markdownInput, setMarkdownInput] = useState('')
  const [insertMode, setInsertMode] = useState<'replace' | 'insert'>('replace')
  const [applyTitle, setApplyTitle] = useState(true)
  const [applyDescription, setApplyDescription] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse frontmatter and metadata on input change
  const { body, detectedTitle, detectedDescription } = useMemo(() => {
    return parseMarkdownWithFrontmatter(markdownInput)
  }, [markdownInput])

  // Generate rich HTML preview with full KaTeX math equation rendering
  const previewHtml = useMemo(() => {
    const rawContent = body.trim() ? body : markdownInput.trim()
    if (!rawContent) return ''
    try {
      return renderMarkdownWithMath(rawContent)
    } catch {
      return ''
    }
  }, [body, markdownInput])

  // Get current editor content as Markdown
  const exportedMarkdown = useMemo(() => {
    if (!isOpen || activeTab !== 'export') return ''
    try {
      const mdStorage = (editor.storage as Record<string, unknown>).markdown as
        | { getMarkdown?: () => string }
        | undefined
      if (typeof mdStorage?.getMarkdown === 'function') {
        return mdStorage.getMarkdown()
      }
      return editor.getText()
    } catch {
      return editor.getText()
    }
  }, [isOpen, activeTab, editor])

  const handleOpen = (open: boolean) => {
    if (open) {
      setMarkdownInput('')
      setPreviewMode(false)
      setCopied(false)
    }
    setIsOpen(open)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      setMarkdownInput(content)
      toast.success(`Loaded "${file.name}"`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to read file')
    }
    // Reset file input value
    e.target.value = ''
  }

  const handleApplyMarkdown = () => {
    const contentToApply = body.trim() ? body : markdownInput.trim()
    if (!contentToApply) {
      toast.error('Please enter or paste some markdown content')
      return
    }

    try {
      const parsedHtml = markdownToTipTapHtml(contentToApply)
      if (insertMode === 'replace') {
        editor.commands.setContent(parsedHtml)
      } else {
        editor.chain().focus().insertContent(parsedHtml).run()
      }

      // Apply metadata if requested and callback provided
      if (onMetadataExtracted) {
        const meta: ExtractedMetadata = {}
        if (applyTitle && detectedTitle) meta.title = detectedTitle
        if (applyDescription && detectedDescription) meta.description = detectedDescription
        if (meta.title || meta.description) {
          onMetadataExtracted(meta)
        }
      }

      toast.success(
        insertMode === 'replace'
          ? 'Markdown applied to editor'
          : 'Markdown inserted at cursor'
      )
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to parse and insert markdown')
    }
  }

  const handleCopyMarkdown = async () => {
    if (!exportedMarkdown) return
    try {
      await navigator.clipboard.writeText(exportedMarkdown)
      setCopied(true)
      toast.success('Markdown copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownloadMarkdown = () => {
    if (!exportedMarkdown) return
    const blob = new Blob([exportedMarkdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'post.md'
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('Downloaded post.md')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip="Import / Export Raw Markdown"
          shortcut="MD"
          icon={
            <div className="flex items-center gap-0.5 font-mono text-xs font-bold leading-none tracking-tight">
              <FileCode2Icon className="size-4" />
            </div>
          }
        />
      </DialogTrigger>

      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto overflow-x-hidden min-w-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileCode2Icon className="size-4" />
            </div>
            <span>Raw Markdown Hub</span>
          </DialogTitle>
          <DialogDescription>
            Input raw Markdown text or import a file to automatically convert it into formatted rich text.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'import' | 'export')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <SparklesIcon className="size-3.5" />
              <span>Import & Apply</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <DownloadIcon className="size-3.5" />
              <span>Export & Copy</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: IMPORT & APPLY */}
          <TabsContent value="import" className="space-y-4 pt-3">
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground mr-1">Templates:</span>
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => setMarkdownInput(tmpl.content)}
                    className="rounded border border-border/80 bg-muted/40 px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".md,.markdown,.txt"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="size-3.5" />
                  <span>Upload .md file</span>
                </Button>
                {markdownInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 cursor-pointer"
                    onClick={() => setMarkdownInput('')}
                  >
                    <Trash2Icon className="size-3.5" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Input / Preview Switcher */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="md-input" className="text-xs font-medium">
                  Paste or Write Raw Markdown
                </Label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                >
                  {previewMode ? (
                    <>
                      <CodeIcon className="size-3.5" />
                      <span>Back to Code</span>
                    </>
                  ) : (
                    <>
                      <EyeIcon className="size-3.5" />
                      <span>Quick Preview</span>
                    </>
                  )}
                </button>
              </div>

              {previewMode ? (
                <div className="min-h-[220px] sm:min-h-[300px] max-h-[440px] overflow-y-auto overflow-x-hidden rounded-md border border-border bg-background p-4 sm:p-6 text-sm shadow-xs break-words">
                  {previewHtml ? (
                    <div
                      className="prose dark:prose-invert max-w-none text-sm leading-relaxed break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nothing to preview yet. Enter markdown above.</p>
                  )}
                </div>
              ) : (
                <Textarea
                  id="md-input"
                  placeholder="# Hello World&#10;&#10;Write or paste your **markdown** here..."
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  className="min-h-[220px] sm:min-h-[300px] font-mono text-xs leading-relaxed resize-y break-words"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Detected Frontmatter & Options */}
            {Boolean(detectedTitle ?? detectedDescription) && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <SparklesIcon className="size-3.5" />
                  <span>Detected Metadata in Markdown</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {detectedTitle && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyTitle}
                        onChange={(e) => setApplyTitle(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span>Apply Post Title: <strong className="text-foreground">{detectedTitle}</strong></span>
                    </label>
                  )}
                  {detectedDescription && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyDescription}
                        onChange={(e) => setApplyDescription(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span>Apply Post Description: <span className="text-muted-foreground italic">{detectedDescription}</span></span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Insertion Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/80 bg-muted/20 px-3 py-2.5">
              <div className="space-y-0.5">
                <span className="text-xs font-medium">Insertion Strategy</span>
                <p className="text-[11px] text-muted-foreground">
                  Choose how the converted markdown is placed into the document
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="insertMode"
                    value="replace"
                    checked={insertMode === 'replace'}
                    onChange={() => setInsertMode('replace')}
                  />
                  <span>Replace Document</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer ml-2">
                  <input
                    type="radio"
                    name="insertMode"
                    value="insert"
                    checked={insertMode === 'insert'}
                    onChange={() => setInsertMode('insert')}
                  />
                  <span>Insert at Cursor</span>
                </label>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyMarkdown}
                disabled={!markdownInput.trim()}
                className="gap-1.5"
              >
                <CheckIcon className="size-3.5" />
                <span>Apply Markdown</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 2: EXPORT & COPY */}
          <TabsContent value="export" className="space-y-4 pt-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="md-export" className="text-xs font-medium">
                  Current Document in Markdown Format
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {exportedMarkdown.length} characters
                </span>
              </div>
              <Textarea
                id="md-export"
                readOnly
                value={exportedMarkdown}
                className="min-h-[240px] sm:min-h-[320px] font-mono text-xs leading-relaxed bg-muted/30 resize-y break-words"
                placeholder="Editor is currently empty..."
              />
            </div>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadMarkdown}
                disabled={!exportedMarkdown.trim()}
                className="gap-1.5"
              >
                <DownloadIcon className="size-3.5" />
                <span>Download .md</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  disabled={!exportedMarkdown.trim()}
                  className="gap-1.5"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="size-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
