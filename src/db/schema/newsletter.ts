import { createId } from '@paralleldrive/cuid2'
import { type InferSelectModel } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const subscribers = pgTable('subscriber', {
  id: text('id').notNull().primaryKey().$defaultFn(createId),
  email: text('email').notNull().unique(),
  subscribed: boolean('subscribed').notNull().default(true),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
})

export type Subscriber = InferSelectModel<typeof subscribers>
