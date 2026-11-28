import { z } from 'zod'

import { Visibility } from '@/db/schema'

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
})

export const deletePostSchema = z.object({
  postId: z.string()
})

export const togglePostLikeSchema = z.object({
  postId: z.string()
})

const httpUrlSchema = z
  .string()
  .trim()
  .url('Please enter a valid URL')
  .refine((val) => {
    try {
      const parsed = new URL(val)
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  }, 'URL must use http:// or https://')

const avatarImageSchema = z
  .string()
  .trim()
  .max(500, 'Image URL is too long')
  .refine((val) => {
    if (!val) return true
    if (val.startsWith('/') && !val.startsWith('//')) return true
    try {
      const parsed = new URL(val)
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  }, 'Avatar must be an http(s) URL or relative path')

export const toggleBookmarkSchema = z.object({
  postId: z.string(),
  bookmarked: z.boolean().optional()
})

export const updatePostSchema = z.object({
  postId: z.string(),
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  content: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  published: z.boolean().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional()
})

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(100),
  image: avatarImageSchema,
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters'),
  github: httpUrlSchema.optional().or(z.literal('')),
  twitter: httpUrlSchema.optional().or(z.literal('')),
  linkedin: httpUrlSchema.optional().or(z.literal('')),
  theme: z.enum(['system', 'light', 'dark']).optional().or(z.literal(''))
})

export const snippetSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(300).optional(),
  code: z.string().min(1).max(20_000),
  language: z.string().min(1).max(40).default('bash'),
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
  published: z.boolean().default(false)
})

export const createSnippetSchema = snippetSchema

export const updateSnippetSchema = snippetSchema.extend({
  snippetId: z.string()
})

export const deleteSnippetSchema = z.object({
  snippetId: z.string()
})
