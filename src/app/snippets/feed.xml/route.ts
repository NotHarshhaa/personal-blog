import { SITE_TITLE, SITE_URL } from '@/lib/constants'
import { getSnippets } from '@/queries/get-snippets'

const escapeXml = (unsafe: string) => {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const { snippets } = await getSnippets()

  const itemsXml = snippets
    .map((snippet) => {
      const snippetUrl = `${SITE_URL}/snippets/${snippet.id}`
      const rawUrl = `${SITE_URL}/raw/${snippet.id}`
      const categoriesXml = snippet.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')

      return `    <item>
      <title>${escapeXml(`[snippet] ${snippet.title}`)}</title>
      <link>${snippetUrl}</link>
      <guid isPermaLink="true">${snippetUrl}</guid>
      <pubDate>${new Date(snippet.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(snippet.description ?? '')}</description>
      <author>${escapeXml(snippet.user.name)}</author>
      <raw url="${rawUrl}" />
${categoriesXml}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_TITLE} — Snippet Vault`)}</title>
    <link>${SITE_URL}/snippets</link>
    <description>${escapeXml('Micro-dispatches: 30-second battle-tested configs, CLI one-liners and raw retrieval via curl.')} </description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/snippets/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    }
  })
}
