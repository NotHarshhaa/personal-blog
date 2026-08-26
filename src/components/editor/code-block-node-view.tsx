'use client'

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'

const LANGUAGES = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'SQL', value: 'sql' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Dockerfile', value: 'dockerfile' }
]

export const CodeBlockNodeView = (props: ReactNodeViewProps) => {
  const { node, updateAttributes } = props
  const [copied, setCopied] = useState(false)

  const currentLanguage = (node.attrs.language as string) || 'plaintext'

  const handleCopy = () => {
    const codeText = node.textContent
    void navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <NodeViewWrapper className="not-prose relative my-5 overflow-hidden rounded-lg border border-border bg-muted/40 shadow-xs">
      {/* Code Block Window Header */}
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/80 px-3 py-1.5 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-2">
          {/* Terminal Window Dots */}
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-red-400/70" />
            <span className="size-2 rounded-full bg-yellow-400/70" />
            <span className="size-2 rounded-full bg-green-400/70" />
          </div>

          {/* Language Selector */}
          <select
            contentEditable={false}
            value={currentLanguage}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground transition-colors hover:bg-background focus:outline-hidden"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="size-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed text-foreground">
        <NodeViewContent as="code" className={`language-${currentLanguage}`} />
      </pre>
    </NodeViewWrapper>
  )
}
