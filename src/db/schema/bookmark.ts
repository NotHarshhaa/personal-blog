import { createId } from '@paralleldrive/cuid2'
import { type InferSelectModel, relations } from 'drizzle-orm'
import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

import { users } from './auth'
import { posts } from './post'

export const bookmarks = pgTable(
  'bookmark',
  {
    id: text('id').notNull().primaryKey().$defaultFn(createId),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
  },
  (table) => [unique().on(table.postId, table.userId)]
)

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  post: one(posts, {
    fields: [bookmarks.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id]
  })
}))

export type Bookmark = InferSelectModel<typeof bookmarks>
