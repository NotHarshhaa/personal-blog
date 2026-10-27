import type { Metadata } from 'next'

import { desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import SnippetManager, { type ManagedSnippet } from '@/components/snippets/snippet-manager'
import { db } from '@/db'
import { snippets } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Snippet Manager',
  robots: { index: false, follow: false }
}

export default async function AdminSnippetsPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'admin') {
    redirect('/not-authorized')
  }

  const rows = await db.query.snippets.findMany({
    orderBy: desc(snippets.createdAt),
    columns: {
      id: true,
      title: true,
      description: true,
      code: true,
      language: true,
      tags: true,
      published: true,
      createdAt: true,
      updatedAt: true
    }
  })

  const managedSnippets: ManagedSnippet[] = rows.map((snippet) => ({
    id: snippet.id,
    title: snippet.title,
    description: snippet.description,
    code: snippet.code,
    language: snippet.language,
    tags: snippet.tags,
    published: snippet.published,
    createdAt: snippet.createdAt.toISOString(),
    updatedAt: snippet.updatedAt.toISOString()
  }))

  return (
    <main className='space-y-6 p-4 sm:p-8'>
      <Frame as='header'>
        <FrameHeader label='Snippet Vault // CLI Dispatch Manager' />
        <FrameBody className='space-y-2'>
          <h1 className='text-foreground text-2xl font-bold tracking-tight sm:text-3xl'>
            Snippet Manager
          </h1>
          <p className='text-muted-foreground font-mono text-xs'>
            File 30-second battle-tested configs into{' '}
            <span className='text-foreground'>/snippets</span>. Each published snippet is
            retrievable raw via <span className='text-foreground'>/raw/&lt;id&gt;</span> for{' '}
            <span className='text-foreground'>curl | bash</span> piping.
          </p>
        </FrameBody>
      </Frame>

      <SnippetManager initialSnippets={managedSnippets} />
    </main>
  )
}
