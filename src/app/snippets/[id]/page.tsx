import type { Metadata } from 'next'

import { ArrowLeft, Calendar, TerminalIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CornerBrackets, Frame, FrameBody, FrameHeader } from '@/components/frame'
import CopyRawButton from '@/components/snippets/copy-raw-button'
import CurlCommand from '@/components/snippets/curl-command'
import { CodeBlock } from '@/components/ui/code-block'
import { SITE_TITLE, SITE_URL } from '@/lib/constants'
import { getSnippetById } from '@/queries/get-snippet-by-id'
import { formatPostDate } from '@/utils/format-post-date'
import { getIconByLanguage } from '@/utils/get-icon-by-language'

const SHELL_LANGUAGES = new Set(['bash', 'sh', 'zsh', 'shell', 'powershell'])

type SnippetPageProps = {
  params: Promise<{
    id: string
  }>
}

export const generateMetadata = async (props: SnippetPageProps): Promise<Metadata> => {
  const { id } = await props.params
  const { snippet } = await getSnippetById(id)

  if (!snippet) return {}

  const tagsQuery =
    snippet.tags.length > 0 ? `&tags=${encodeURIComponent(snippet.tags.slice(0, 4).join(','))}` : ''
  const descriptionQuery = snippet.description
    ? `&description=${encodeURIComponent(snippet.description)}`
    : ''
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(snippet.title)}${descriptionQuery}${tagsQuery}`

  return {
    title: snippet.title,
    description: snippet.description ?? undefined,
    alternates: {
      canonical: `${SITE_URL}/snippets/${id}`
    },
    openGraph: {
      url: `${SITE_URL}/snippets/${id}`,
      type: 'article',
      title: snippet.title,
      description: snippet.description ?? undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: snippet.title,
          type: 'image/png'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: snippet.title,
      description: snippet.description ?? undefined,
      images: [ogImageUrl]
    }
  }
}

const SnippetPage = async (props: SnippetPageProps) => {
  const { id } = await props.params
  const { snippet } = await getSnippetById(id)

  if (!snippet) {
    notFound()
  }

  const isShell = SHELL_LANGUAGES.has(snippet.language.toLowerCase())
  const rawUrl = `${SITE_URL}/raw/${snippet.id}`
  const curlCommand = `curl -fsSL ${rawUrl}`
  const curlPipeCommand = `${curlCommand} | bash`
  const Icon = getIconByLanguage(snippet.language)
  const dateTime = formatPostDate(snippet.createdAt, { format: 'YYYY-MM-DD' })
  const lineCount = snippet.code.split('\n').length

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: snippet.title,
    description: snippet.description,
    codeSample: snippet.code,
    codeRepository: rawUrl,
    programmingLanguage: snippet.language,
    datePublished: snippet.createdAt.toISOString(),
    dateModified: snippet.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: snippet.user.name,
      url: `${SITE_URL}/users/${snippet.user.id}`
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_TITLE,
      url: SITE_URL
    },
    keywords: snippet.tags.join(', ')
  }

  return (
    <article className='relative z-10 w-full space-y-6 sm:space-y-8'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className='text-muted-foreground flex items-center justify-between font-mono text-xs'>
        <Link
          href='/snippets'
          className='group hover:text-foreground inline-flex items-center gap-1.5 transition-colors'
        >
          <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-1' />
          <span>Back to the vault</span>
        </Link>

        <a
          href={`/raw/${snippet.id}`}
          target='_blank'
          rel='noopener noreferrer'
          className='border-border bg-background hover:border-foreground hover:text-foreground inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] tracking-wider uppercase transition-colors'
        >
          <TerminalIcon className='size-3' />
          <span>View raw</span>
        </a>
      </div>

      <Frame as='header'>
        <FrameHeader label='Snippet'>
          <div className='text-muted-foreground flex items-center gap-2 font-mono text-[10px] uppercase'>
            <span className='border-border bg-background text-foreground inline-flex items-center gap-1 border px-2 py-0.5 font-semibold'>
              <Icon className='size-3' />
              {snippet.language}
            </span>
            <span>{lineCount} lines</span>
          </div>
        </FrameHeader>

        <FrameBody className='space-y-5'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='border-border bg-background text-muted-foreground inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px]'>
              <UserIcon className='size-3' />
              <span>{snippet.user.name}</span>
            </div>
            <div className='border-border bg-background/80 text-muted-foreground inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px]'>
              <Calendar className='size-3' />
              <time dateTime={dateTime}>
                {formatPostDate(snippet.createdAt, { relative: true })}
              </time>
            </div>
          </div>

          <h1 className='text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl'>
            {snippet.title}
          </h1>

          {snippet.description && (
            <div className='border-foreground/30 border-l-2 py-0.5 pl-3.5'>
              <p className='text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base'>
                {snippet.description}
              </p>
            </div>
          )}

          {snippet.tags.length > 0 && (
            <ul className='flex flex-wrap gap-1.5 pt-1' aria-label='Snippet topics'>
              {snippet.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/snippets?tag=${encodeURIComponent(tag)}`}
                    className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-block border px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase transition-colors'
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </FrameBody>
      </Frame>

      <Frame>
        <FrameHeader label='Source'>
          <CopyRawButton text={snippet.code} successMessage={`"${snippet.title}" copied raw`} />
        </FrameHeader>
        <FrameBody>
          <CodeBlock title={snippet.language} data-lang={snippet.language} className='text-xs'>
            <code>{snippet.code}</code>
          </CodeBlock>
        </FrameBody>
      </Frame>

      <Frame>
        <FrameHeader label='Zero-friction retrieval' />
        <FrameBody className='space-y-4'>
          <CurlCommand
            command={isShell ? curlPipeCommand : curlCommand}
            hint={
              isShell
                ? 'Pipes the raw source straight into your shell. Review the raw output first if you are cautious.'
                : 'Fetches the raw snippet — review it, then redirect or pipe it however you like.'
            }
          />
          <div className='border-border bg-muted/40 relative border p-3.5'>
            <CornerBrackets className='size-2' />
            <p className='text-muted-foreground font-mono text-[11px] leading-relaxed'>
              <span className='text-foreground font-semibold'>PERMANENT URL:</span>{' '}
              <a
                href={`/raw/${snippet.id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-foreground decoration-border hover:decoration-foreground break-all underline underline-offset-2 transition-colors'
              >
                {rawUrl}
              </a>
              <br />
              <span className='text-foreground font-semibold'>THIS PAGE:</span>{' '}
              <a
                href={`/snippets/${snippet.id}`}
                className='text-foreground decoration-border hover:decoration-foreground break-all underline underline-offset-2 transition-colors'
              >
                {SITE_URL}/snippets/{snippet.id}
              </a>
            </p>
          </div>
        </FrameBody>
      </Frame>
    </article>
  )
}

export default SnippetPage
