import EmptyState from '@/components/empty-state'
import { Frame } from '@/components/frame'
import SnippetCard from '@/components/snippets/snippet-card'
import { getSnippets } from '@/queries/get-snippets'

type SnippetsProps = {
  tag?: string
}

const Snippets = async ({ tag }: SnippetsProps) => {
  const { snippets } = await getSnippets()

  const activeTag = tag?.trim()
  const filtered = activeTag
    ? snippets.filter((snippet) =>
        snippet.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      )
    : snippets

  const allTags = [...new Set(snippets.flatMap((snippet) => snippet.tags))].toSorted((a, b) =>
    a.localeCompare(b)
  )

  if (snippets.length === 0) {
    return (
      <EmptyState
        title='The vault is empty'
        description='No battle-tested configs have been declassified yet. Snippets are short, production-grade fixes — kubectl JSONPath tricks, Terraform state surgery, GPG signing repairs and Docker optimizations.'
        showAction={false}
      />
    )
  }

  return (
    <div className='space-y-5'>
      {allTags.length > 0 && (
        <nav
          aria-label='Snippet topic filters'
          className='flex flex-wrap items-center gap-1.5 font-mono text-[11px]'
        >
          <span className='text-muted-foreground mr-1 tracking-wider uppercase'>Filter:</span>
          <a
            href='/snippets'
            className={`border px-2 py-0.5 tracking-wide uppercase transition-colors ${
              activeTag
                ? 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                : 'border-foreground bg-foreground text-background font-semibold'
            }`}
          >
            ALL
          </a>
          {allTags.map((t) => (
            <a
              key={t}
              href={`/snippets?tag=${encodeURIComponent(t)}`}
              className={`border px-2 py-0.5 tracking-wide uppercase transition-colors ${
                activeTag?.toLowerCase() === t.toLowerCase()
                  ? 'border-foreground bg-foreground text-background font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              #{t}
            </a>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <Frame>
          <div className='px-5 py-12 text-center'>
            <p className='text-muted-foreground font-mono text-sm'>
              No snippets tagged <span className='text-foreground'>#{activeTag}</span>
            </p>
            <a
              href='/snippets'
              className='border-border text-muted-foreground hover:border-foreground hover:text-foreground mt-3 inline-block border px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-colors'
            >
              Clear filter
            </a>
          </div>
        </Frame>
      ) : (
        <div className='space-y-5'>
          {activeTag && (
            <p className='text-muted-foreground font-mono text-xs'>
              Showing {filtered.length} snippet{filtered.length === 1 ? '' : 's'} tagged{' '}
              <span className='text-foreground'>#{activeTag}</span>
            </p>
          )}
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Snippets
