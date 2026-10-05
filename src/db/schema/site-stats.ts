import { type InferSelectModel } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'

// Single-row table holding the durable site-wide visit counter so the total
// survives restarts and is shared across server instances.
export const siteStats = pgTable('site_stats', {
  id: text('id').notNull().primaryKey(),
  visits: integer('visits').notNull().default(0)
})

export type SiteStat = InferSelectModel<typeof siteStats>
