'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { toggleBookmarkAction } from '@/actions/toggle-bookmark-action'

export type LocalBookmark = {
  id: string
  title: string
  description?: string | null
  createdAt: string
  tags?: string[]
}

const STORAGE_KEY = 'blog_bookmarks_v1'
const EMPTY_BOOKMARKS: LocalBookmark[] = []

export const useBookmarks = (
  userId?: string | null,
  initialBookmarks: LocalBookmark[] = EMPTY_BOOKMARKS
) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [localBookmarks, setLocalBookmarks] = useState<LocalBookmark[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const hasLoadedRef = useRef(false)

  // Load from localStorage
  const reloadFromStorage = useCallback(() => {
    try {
      const raw = globalThis.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as LocalBookmark[]
        const bookmarks = hasLoadedRef.current
          ? parsed
          : Array.from(
              new Map([...parsed, ...initialBookmarks].map((item) => [item.id, item])).values()
            )
        setLocalBookmarks(bookmarks)
        setBookmarkedIds(bookmarks.map((item) => item.id))
        if (!hasLoadedRef.current && initialBookmarks.length > 0) {
          globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
        }
      } else {
        setLocalBookmarks(initialBookmarks)
        setBookmarkedIds(initialBookmarks.map((item) => item.id))
        if (initialBookmarks.length > 0) {
          globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBookmarks))
        }
      }
    } catch {
      setLocalBookmarks(initialBookmarks)
      setBookmarkedIds(initialBookmarks.map((item) => item.id))
    } finally {
      hasLoadedRef.current = true
      setIsLoaded(true)
    }
  }, [initialBookmarks])

  useEffect(() => {
    reloadFromStorage()

    const handleStorageChange = () => {
      reloadFromStorage()
    }

    globalThis.addEventListener('bookmarks-updated', handleStorageChange)
    globalThis.addEventListener('storage', handleStorageChange)

    return () => {
      globalThis.removeEventListener('bookmarks-updated', handleStorageChange)
      globalThis.removeEventListener('storage', handleStorageChange)
    }
  }, [reloadFromStorage])

  const isBookmarked = useCallback(
    (postId: string) => bookmarkedIds.includes(postId),
    [bookmarkedIds]
  )

  const toggleBookmark = useCallback(
    async (post: {
      id: string
      title: string
      description?: string | null
      createdAt?: string | Date
      tags?: string[]
    }) => {
      const postId = post.id
      const currentlyBookmarked = bookmarkedIds.includes(postId)

      // Optimistic local state update
      let updatedList: LocalBookmark[]
      if (currentlyBookmarked) {
        updatedList = localBookmarks.filter((item) => item.id !== postId)
      } else {
        const newBookmark: LocalBookmark = {
          id: postId,
          title: post.title,
          description: post.description ?? null,
          createdAt: post.createdAt
            ? new Date(post.createdAt).toISOString()
            : new Date().toISOString(),
          tags: post.tags ?? []
        }
        updatedList = [newBookmark, ...localBookmarks]
      }

      setLocalBookmarks(updatedList)
      setBookmarkedIds(updatedList.map((item) => item.id))
      toast.success(currentlyBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks')

      try {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
        globalThis.dispatchEvent(new Event('bookmarks-updated'))
      } catch {
        // storage quota error ignore
      }

      // If authenticated, sync with database
      if (userId) {
        try {
          await toggleBookmarkAction({ postId })
        } catch {
          // Keep local state functioning
        }
      }
    },
    [bookmarkedIds, localBookmarks, userId]
  )

  return {
    isLoaded,
    isBookmarked,
    toggleBookmark,
    bookmarks: localBookmarks,
    bookmarkCount: bookmarkedIds.length
  }
}
