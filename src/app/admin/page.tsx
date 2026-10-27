import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import RefreshEngagementButton from '@/components/refresh-engagement-button'
import { db } from '@/db'
import { posts, subscribers } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'

import { NewsletterDispatcher } from './newsletter-dispatcher'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'admin') {
    redirect('/not-authorized')
  }

  // 1. Fetch active subscribers count
  const activeSubs = await db.query.subscribers.findMany({
    where: eq(subscribers.subscribed, true),
    columns: {
      id: true
    }
  })

  // 2. Fetch published posts for the dispatch pipeline
  const publishedPostsData = await db.query.posts.findMany({
    where: eq(posts.published, true),
    orderBy: desc(posts.createdAt),
    columns: {
      id: true,
      title: true,
      description: true,
      content: true,
      tags: true,
      createdAt: true
    },
    with: {
      user: {
        columns: {
          name: true
        }
      }
    }
  })

  const publishedPosts = publishedPostsData.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
    author: {
      name: p.user.name
    }
  }))

  return (
    <main className="space-y-6 p-4 sm:p-8">
      {/* Header */}
      <Frame as="header">
        <FrameHeader label="Admin // System Control Panel" />
        <FrameBody className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Authenticated operator: <span className="text-foreground">{user.email}</span>
          </p>
        </FrameBody>
      </Frame>

      {/* Newsletter Delivery Engine Section */}
      <Frame as="section">
        <FrameHeader label="PUBLICATION PIPELINE // EMAIL DISPATCH ENGINE" />
        <FrameBody className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Automated Newsletter Dispatch
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              Compile published Markdown &amp; Tiptap posts into sharp, monochromatic
              0px-radius HTML emails and dispatch them directly to all active subscribers via
              Resend.
            </p>
          </div>

          <NewsletterDispatcher
            subscriberCount={activeSubs.length}
            publishedPosts={publishedPosts}
          />
        </FrameBody>
      </Frame>

      {/* Article Metrics Sync Section */}
      <Frame as="section">
        <FrameHeader label="Article metrics // Telemetry Calibration" />
        <FrameBody className="space-y-3">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Recalculate article metrics
          </h2>
          <p className="text-xs text-muted-foreground">
            Synchronize baseline views and engagement metrics for published articles based
            on their publication date and reader velocity. Drafts keep their private
            counters hidden.
          </p>
          <RefreshEngagementButton />
        </FrameBody>
      </Frame>
    </main>
  )
}
