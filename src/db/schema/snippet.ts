import { createId } from '@paralleldrive/cuid2'
import { type InferSelectModel, relations, sql } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth'

export const snippets = pgTable(
  'snippet',
  {
    id: text('id').notNull().primaryKey().$defaultFn(createId),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    code: text('code').notNull(),
    language: text('language').notNull().default('bash'),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    published: boolean('published').notNull().default(false),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).notNull().defaultNow()
  },
  (table) => [index('snippet_created_at_idx').on(table.createdAt)]
)

export const snippetsRelations = relations(snippets, ({ one }) => ({
  user: one(users, {
    fields: [snippets.authorId],
    references: [users.id]
  })
}))

export type Snippet = InferSelectModel<typeof snippets>
