'use client'

import {
  NodeViewContent,
  NodeViewWrapper,
  type ReactNodeViewProps
} from '@tiptap/react'
import {
  CheckIcon,
  CopyIcon,
  FileCodeIcon,
  GitCompareIcon,
  HashIcon,
  TerminalIcon
} from 'lucide-react'
import { useState } from 'react'

import { CornerBrackets } from '@/components/frame'
import { cn } from '@/utils'

const LANGUAGES = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Diff (+ / -)', value: 'diff' },
  { label: 'YAML / Kubernetes', value: 'yaml' },
  { label: 'Dockerfile', value: 'dockerfile' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'HCL / Terraform', value: 'hcl' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
  { label: 'SQL', value: 'sql' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Markdown', value: 'markdown' }
]

export const CodeBlockNodeView = (props: ReactNodeViewProps) => {
  const { node, updateAttributes, editor } = props
  const [copied, setCopied] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(
    node.attrs.showLineNumbers !== false
  )

  const currentLanguage = (node.attrs.language as string) || 'plaintext'
  const filename = (node.attrs.filename as string) || ''

  const handleCopy = () => {
    const codeText = node.textContent
    void globalThis.navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const selectedLanguageLabel =
    LANGUAGES.find((lang) => lang.value === currentLanguage)?.label ??
    currentLanguage

  const isTerminal = currentLanguage === 'bash' || currentLanguage === 'shell'
  const isDiff = currentLanguage === 'diff'

  const lineCount = node.textContent.split('\n').length

  let filenameElement: React.ReactNode = null
  if (editor.isEditable) {
    filenameElement = (
      <input
        type="text"
        value={filename}
        placeholder="filename (e.g. main.tf, deployment.yaml)"
        onChange={(e) => updateAttributes({ filename: e.target.value })}
        className="h-6 w-44 border border-border bg-background px-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground"
      />
    )
  } else if (filename) {
    filenameElement = (
      <div className="flex items-center gap-1.5 border border-border bg-background px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
        <span className="text-muted-foreground/60">#</span>
        <span>{filename}</span>
      </div>
    )
  }

  return (
    <NodeViewWrapper className="not-prose code-block-blueprint relative my-6 w-full border border-border bg-card">
      <CornerBrackets />

      {/* Blueprint Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-muted/40 px-3.5 py-2 select-none sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Indicator */}
          {editor.isEditable ? (
            <select
              contentEditable={false}
              value={currentLanguage}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className="h-6 border border-border bg-background px-2 font-mono text-[11px] font-medium text-foreground transition-colors hover:border-foreground focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {isTerminal && <TerminalIcon className="size-3 text-foreground" />}
              {isDiff && <GitCompareIcon className="size-3 text-foreground" />}
              {!isTerminal && !isDiff && (
                <FileCodeIcon className="size-3 text-foreground/70" />
              )}
              <span>{selectedLanguageLabel}</span>
            </div>
          )}

          {/* Filename Tag */}
          {filenameElement}
        </div>

        {/* Blueprint Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Line Numbers */}
          <button
            type="button"
            onClick={() => {
              const next = !showLineNumbers
              setShowLineNumbers(next)
              if (editor.isEditable) {
                updateAttributes({ showLineNumbers: next })
              }
            }}
            className={cn(
              'inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer active:translate-y-px',
              showLineNumbers
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
            )}
            title="Toggle line numbers"
          >
            <HashIcon className="size-3" />
            <span>
              {lineCount} {lineCount === 1 ? 'LINE' : 'LINES'}
            </span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:bg-muted hover:text-foreground cursor-pointer active:translate-y-px"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon className="size-3 text-foreground" />
                <span className="font-semibold text-foreground">
                  COPIED
                </span>
              </>
            ) : (
              <>
                <CopyIcon className="size-3" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="relative flex w-full max-w-full overflow-x-auto bg-card/60">
        {showLineNumbers && (
          <div
            aria-hidden
            className="sticky left-0 z-10 flex flex-col border-r border-border bg-muted/20 px-3 py-3.5 text-right font-mono text-[12px] leading-relaxed text-muted-foreground/40 select-none"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}

        <pre
          className={cn(
            'w-full max-w-full overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed whitespace-pre break-normal selection:bg-foreground selection:text-background',
            isDiff && 'bg-background/40'
          )}
        >
          <NodeViewContent
            as="code"
            className={cn(
              `language-${currentLanguage}`,
              'whitespace-pre break-normal'
            )}
          />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}

export default CodeBlockNodeView
