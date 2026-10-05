'use client'

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
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
  const [showLineNumbers, setShowLineNumbers] = useState(node.attrs.showLineNumbers !== false)

  const currentLanguage = (node.attrs.language as string) || 'plaintext'
  const filename = (node.attrs.filename as string) || ''

  const handleCopy = () => {
    const codeText = node.textContent
    void globalThis.navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const selectedLanguageLabel =
    LANGUAGES.find((lang) => lang.value === currentLanguage)?.label ?? currentLanguage

  const isTerminal = currentLanguage === 'bash' || currentLanguage === 'shell'
  const isDiff = currentLanguage === 'diff'

  const lineCount = node.textContent.split('\n').length

  const languageIcon = (
    <>
      {isTerminal && <TerminalIcon className='size-3.5 shrink-0' />}
      {isDiff && <GitCompareIcon className='size-3.5 shrink-0' />}
      {!isTerminal && !isDiff && <FileCodeIcon className='size-3.5 shrink-0 opacity-70' />}
    </>
  )

  // ── Authoring mode: keep the blueprint controls (language select, filename,
  // line-number toggle) so editors keep their tooling. ──
  if (editor.isEditable) {
    const filenameElement = (
      <input
        type='text'
        value={filename}
        placeholder='filename (e.g. main.tf, deployment.yaml)'
        onChange={(e) => updateAttributes({ filename: e.target.value })}
        className='border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-foreground h-6 w-44 border px-2 font-mono text-[11px] outline-none'
      />
    )

    return (
      <NodeViewWrapper className='not-prose code-block-blueprint border-border bg-card relative my-6 w-full border'>
        <CornerBrackets />

        {/* Blueprint Header */}
        <div className='border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2.5 border-b px-3.5 py-2 select-none sm:px-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <select
              contentEditable={false}
              value={currentLanguage}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className='border-border bg-background text-foreground hover:border-foreground focus:border-foreground h-6 cursor-pointer border px-2 font-mono text-[11px] font-medium transition-colors outline-none'
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            {filenameElement}
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => {
                const next = !showLineNumbers
                setShowLineNumbers(next)
                updateAttributes({ showLineNumbers: next })
              }}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 border px-2 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors active:translate-y-px',
                showLineNumbers
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
              )}
              title='Toggle line numbers'
            >
              <HashIcon className='size-3' />
              <span>
                {lineCount} {lineCount === 1 ? 'LINE' : 'LINES'}
              </span>
            </button>

            <button
              type='button'
              onClick={handleCopy}
              className='border-border bg-background text-muted-foreground hover:border-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider uppercase transition-colors active:translate-y-px'
              title='Copy code to clipboard'
            >
              {copied ? (
                <>
                  <CheckIcon className='text-foreground size-3' />
                  <span className='text-foreground font-semibold'>COPIED</span>
                </>
              ) : (
                <>
                  <CopyIcon className='size-3' />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className='bg-card/60 relative flex w-full max-w-full overflow-x-auto overscroll-x-contain'>
          {showLineNumbers && (
            <div
              aria-hidden
              className='border-border bg-muted/20 text-muted-foreground/40 sticky left-0 z-10 flex flex-col border-r px-3 py-3.5 text-right font-mono text-[12px] leading-relaxed select-none'
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          )}

          <pre
            className={cn(
              'selection:bg-foreground selection:text-background w-full max-w-full overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed break-normal whitespace-pre',
              isDiff && 'bg-background/40',
              showLineNumbers && 'pl-3'
            )}
          >
            <NodeViewContent
              as='code'
              className={cn(`language-${currentLanguage}`, 'break-normal whitespace-pre')}
            />
          </pre>
        </div>
      </NodeViewWrapper>
    )
  }

  // ── Reading mode: card style ported from the reference portfolio — rounded
  // mat surface, mono title row, hover-reveal copy button with fade overlay. ──
  return (
    <NodeViewWrapper
      as='figure'
      className='not-prose code-block-figure group/code border-border bg-card relative my-6 w-full rounded-xl border p-1'
    >
      {/* Title row */}
      <figcaption className='text-muted-foreground flex items-center gap-2 py-2 pr-12 pl-3 font-mono text-[11px] tracking-wider uppercase select-none'>
        {languageIcon}
        <span>{selectedLanguageLabel}</span>
        {filename && (
          <>
            <span className='text-border'>/</span>
            <span className='text-foreground truncate font-medium tracking-normal normal-case'>
              {filename}
            </span>
          </>
        )}
      </figcaption>

      {/* Code surface */}
      <div className='bg-background/40 relative flex w-full max-w-full overflow-x-auto overscroll-x-contain rounded-lg py-4'>
        {showLineNumbers && (
          <div
            aria-hidden
            className='border-border/60 bg-background/40 text-muted-foreground/50 sticky left-0 z-[1] flex shrink-0 flex-col border-r px-3 text-right font-mono text-[13px] leading-relaxed select-none'
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}

        <pre
          className={cn(
            'selection:bg-foreground selection:text-background w-full max-w-full overflow-x-auto pr-4 font-mono text-[13px] leading-relaxed break-normal whitespace-pre',
            showLineNumbers ? 'pl-3' : 'pl-4'
          )}
        >
          <NodeViewContent
            as='code'
            className={cn(`language-${currentLanguage}`, 'break-normal whitespace-pre')}
          />
        </pre>

        {/* Fade overlay behind the copy button so it stays readable over code */}
        <div
          aria-hidden
          className='pointer-events-none absolute top-0 right-0 z-[1] h-9 w-14 rounded-tr-lg opacity-0 transition-opacity group-hover/code:opacity-100'
          style={{
            backgroundImage: 'linear-gradient(to right, transparent, var(--background))'
          }}
        />
        <button
          type='button'
          onClick={handleCopy}
          className={cn(
            'border-border bg-background text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5 z-[2] inline-flex size-7 cursor-pointer items-center justify-center rounded-md border transition-opacity group-hover/code:opacity-100 focus-visible:opacity-100',
            copied ? 'text-foreground opacity-100' : 'opacity-0'
          )}
          title='Copy code to clipboard'
          aria-label='Copy code to clipboard'
        >
          {copied ? <CheckIcon className='size-3.5' /> : <CopyIcon className='size-3.5' />}
        </button>
      </div>
    </NodeViewWrapper>
  )
}

export default CodeBlockNodeView
