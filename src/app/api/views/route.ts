import { and, eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/db'
import { posts, siteStats } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

// Site-wide visitor count = the same aggregate the "Total reads" telemetry
// shows (real stored views + per-post seeded baseline that grows daily), plus
// a durable site-visit counter persisted in the site_stats table so it
// survives restarts and is shared across server instances.

const SITE_STATS_ROW_ID = 'site'

async function getTotalReads(): Promise<number> {
  const result = await db.query.posts.findMany({
    where: and(eq(posts.published, true), eq(posts.visibility, 'public')),
    columns: {
      id: true,
      createdAt: true,
      published: true,
      views: true,
      baselineViews: true,
      baselineLikes: true
    },
    with: {
      likes: {
        columns: {
          id: true
        }
      }
    }
  })

  return result.reduce((sum, post) => sum + withPostEngagement(post).views, 0)
}

async function getSiteVisits(): Promise<number> {
  const row = await db.query.siteStats.findFirst({
    where: eq(siteStats.id, SITE_STATS_ROW_ID),
    columns: {
      visits: true
    }
  })

  return row?.visits ?? 0
}

export async function GET() {
  try {
    const [totalReads, siteVisits] = await Promise.all([getTotalReads(), getSiteVisits()])

    return NextResponse.json({ views: totalReads + siteVisits })
  } catch (error) {
    console.error('Error fetching site views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Atomic upsert-increment; creates the counter row on first visit.
    const [row] = await db
      .insert(siteStats)
      .values({ id: SITE_STATS_ROW_ID, visits: 1 })
      .onConflictDoUpdate({
        target: siteStats.id,
        set: { visits: sql`${siteStats.visits} + 1` }
      })
      .returning({ visits: siteStats.visits })

    const totalReads = await getTotalReads()

    return NextResponse.json({ views: totalReads + (row?.visits ?? 0) })
  } catch (error) {
    console.error('Error tracking site visit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
