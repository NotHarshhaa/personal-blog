import { createId } from '@paralleldrive/cuid2'
import { type InferSelectModel, relations, sql } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'
import { bookmarks } from './bookmark'
import { likes } from './like'
import { series } from './series'

export enum Visibility {
  Public = 'public',
  Private = 'private'
}

export const visibilityEnum = pgEnum(
  'visibility',
  Object.values(Visibility) as [string, ...string[]]
)

export const posts = pgTable('post', {
  id: text('id').notNull().primaryKey().$defaultFn(createId),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  published: boolean('published').notNull().default(false),
  views: integer('views').notNull().default(0),
  baselineViews: integer('baseline_views').notNull().default(0),
  baselineLikes: integer('baseline_likes').notNull().default(0),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow(),
  visibility: visibilityEnum('visibility').default('public').notNull(),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  seriesId: text('series_id').references(() => series.id, { onDelete: 'set null' }),
  seriesOrder: integer('series_order').notNull().default(1)
})

export const postsRelations = relations(posts, ({ one, many }) => ({
  likes: many(likes),
  bookmarks: many(bookmarks),
  user: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  series: one(series, {
    fields: [posts.seriesId],
    references: [series.id]
  })
}))

export type Post = InferSelectModel<typeof posts>
