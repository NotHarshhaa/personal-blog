import { ArrowUpRight, Calendar, TerminalIcon } from 'lucide-react'
import Link from 'next/link'

import { CornerBrackets, Frame } from '@/components/frame'
import CopyRawButton from '@/components/snippets/copy-raw-button'
import { formatPostDate } from '@/utils/format-post-date'
import { getIconByLanguage } from '@/utils/get-icon-by-language'

export type SnippetCardData = {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  tags: string[]
  createdAt: Date
}

const PREVIEW_LINE_COUNT = 6

const SnippetCard = ({ snippet }: { snippet: SnippetCardData }) => {
  const Icon = getIconByLanguage(snippet.language)
  const lines = snippet.code.split('\n')
  const preview = lines.slice(0, PREVIEW_LINE_COUNT).join('\n')
  const hasMore = lines.length > PREVIEW_LINE_COUNT
  const dateTime = formatPostDate(snippet.createdAt, { format: 'YYYY-MM-DD' })

  return (
    <Frame className='group/snippet hover:border-foreground/60 transition-colors'>
      <div className='border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5'>
        <div className='flex items-center gap-2'>
          <span className='border-border bg-background text-foreground flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase'>
            <Icon className='size-3' />
            {snippet.language}
          </span>
          <span className='text-muted-foreground hidden items-center gap-1.5 font-mono text-[10px] sm:inline-flex'>
            <Calendar className='size-3' />
            <time dateTime={dateTime}>{formatPostDate(snippet.createdAt, { relative: true })}</time>
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <CopyRawButton text={snippet.code} successMessage={`"${snippet.title}" copied raw`} />
          <Link
            href={`/snippets/${snippet.id}`}
            className='text-muted-foreground hover:text-foreground flex items-center gap-1 border border-transparent px-1.5 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors'
          >
            Open
            <ArrowUpRight className='size-3.5 transition-transform group-hover/snippet:translate-x-0.5 group-hover/snippet:-translate-y-0.5' />
          </Link>
        </div>
      </div>

      <div className='px-4 py-4 sm:px-5'>
        <Link href={`/snippets/${snippet.id}`} className='block'>
          <h3 className='text-foreground text-lg font-bold tracking-tight transition-colors hover:underline sm:text-xl'>
            {snippet.title}
          </h3>
        </Link>
        {snippet.description && (
          <p className='text-muted-foreground mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed'>
            {snippet.description}
          </p>
        )}

        <div className='border-border bg-muted/60 relative mt-4 border'>
          <CornerBrackets className='size-1.5' />
          <div className='border-border bg-card text-muted-foreground flex items-center gap-1.5 border-b px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase'>
            <TerminalIcon className='size-3' />
            <span>{snippet.language}</span>
            <span className='ml-auto'>
              {lines.length} {lines.length === 1 ? 'line' : 'lines'}
            </span>
          </div>
          <pre className='text-foreground overflow-x-auto px-3.5 py-3 font-mono text-xs leading-relaxed'>
            <code>
              {preview}
              {hasMore && '\n…'}
            </code>
          </pre>
        </div>

        {snippet.tags.length > 0 && (
          <ul className='mt-3.5 flex flex-wrap gap-1.5' aria-label='Snippet topics'>
            {snippet.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/snippets?tag=${encodeURIComponent(tag)}`}
                  className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-block border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase transition-colors'
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Frame>
  )
}

export default SnippetCard
