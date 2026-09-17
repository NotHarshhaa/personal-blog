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
      <div className="flex items-center gap-1.5">
        <FileCodeIcon className="size-3.5 text-muted-foreground" />
        <input
          type="text"
          value={filename}
          placeholder="filename (e.g. main.tf, deployment.yaml)"
          onChange={(e) => updateAttributes({ filename: e.target.value })}
          className="h-6 w-48 rounded border border-border/70 bg-background/80 px-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground"
        />
      </div>
    )
  } else if (filename) {
    filenameElement = (
      <div className="flex items-center gap-1.5 rounded border border-border/60 bg-background/80 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
        <FileCodeIcon className="size-3.5 text-foreground" />
        <span>{filename}</span>
      </div>
    )
  }

  return (
    <NodeViewWrapper className="not-prose relative my-6 max-w-full overflow-hidden border border-border bg-card shadow-sm">
      {/* Code Block Window Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/60 px-3 py-2 text-xs text-muted-foreground select-none">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Terminal Window Dots */}
          <div className="flex items-center gap-1.5 pr-1">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-yellow-400/80" />
            <span className="size-2.5 rounded-full bg-green-400/80" />
          </div>

          {/* Filename Display (Read-only) or Input (Editable) */}
          {filenameElement}

          {/* Language Selector (editable) or Badge (read-only) */}
          {editor.isEditable ? (
            <select
              contentEditable={false}
              value={currentLanguage}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className="h-6 rounded border border-border/70 bg-background/80 px-2 font-mono text-[11px] font-medium text-foreground transition-colors hover:bg-background focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1 rounded border border-border/50 bg-background/50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {isTerminal && <TerminalIcon className="size-3 text-emerald-500" />}
              {isDiff && <GitCompareIcon className="size-3 text-amber-500" />}
              <span>{selectedLanguageLabel}</span>
            </div>
          )}
        </div>

        {/* Action Controls: Line numbers toggle & Copy */}
        <div className="flex items-center gap-2">
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
              'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors cursor-pointer',
              showLineNumbers
                ? 'border-border/80 bg-background/80 text-foreground'
                : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground'
            )}
            title="Toggle line numbers"
          >
            <HashIcon className="size-3" />
            <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded border border-border/70 bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:bg-background hover:text-foreground cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon className="size-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Copied
                </span>
              </>
            ) : (
              <>
                <CopyIcon className="size-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content Area with Line Numbers */}
      <div className="relative flex w-full max-w-full overflow-x-auto bg-card">
        {showLineNumbers && (
          <div
            aria-hidden
            className="sticky left-0 z-10 flex flex-col border-r border-border/60 bg-muted/20 px-2.5 py-3.5 text-right font-mono text-[12px] leading-relaxed text-muted-foreground/40 select-none"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}

        <pre
          className={cn(
            'w-full max-w-full overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed whitespace-pre break-normal',
            isDiff && 'bg-background/40'
          )}
        >
          <NodeViewContent
            as="code"
            className={cn(`language-${currentLanguage}`, 'whitespace-pre break-normal')}
          />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}

export default CodeBlockNodeView
