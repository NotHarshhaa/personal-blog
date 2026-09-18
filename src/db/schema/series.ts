import { createId } from '@paralleldrive/cuid2'
import { type InferSelectModel, relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { posts } from './post'

export const series = pgTable('series', {
  id: text('id').notNull().primaryKey().$defaultFn(createId),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow()
})

export const seriesRelations = relations(series, ({ many }) => ({
  posts: many(posts)
}))

export type Series = InferSelectModel<typeof series>
