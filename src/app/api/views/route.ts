import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

// Site-wide visitor count = the same aggregate the "Total reads" telemetry
// shows (real stored views + per-post seeded baseline that grows daily), plus
// one in-memory counter for real site visits (best effort; resets on restart).

let siteVisits = 0

async function computeSiteViews(): Promise<number> {
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

  const totalReads = result.reduce(
    (sum, post) => sum + withPostEngagement(post).views,
    0
  )

  return totalReads + siteVisits
}

export async function GET() {
  try {
    return NextResponse.json({ views: await computeSiteViews() })
  } catch (error) {
    console.error('Error fetching site views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    siteVisits += 1
    return NextResponse.json({ views: await computeSiteViews() })
  } catch (error) {
    console.error('Error tracking site visit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
