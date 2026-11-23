'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const persistBookmarks = (next: LocalBookmark[]) => {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    globalThis.dispatchEvent(new Event('bookmarks-updated'))
  } catch {
    // storage quota error ignore
  }
}

export const useBookmarks = (
  userId?: string | null,
  initialBookmarks: LocalBookmark[] = EMPTY_BOOKMARKS
) => {
  const [localBookmarks, setLocalBookmarks] = useState<LocalBookmark[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  // Ref mirror of localBookmarks so rapid successive toggles always read
  // the freshest list instead of a stale render-time snapshot.
  const bookmarksRef = useRef<LocalBookmark[]>([])
  const hasLoadedRef = useRef(false)

  const setBookmarks = useCallback((next: LocalBookmark[]) => {
    bookmarksRef.current = next
    setLocalBookmarks(next)
  }, [])

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
        setBookmarks(bookmarks)
        if (!hasLoadedRef.current && initialBookmarks.length > 0) {
          globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
        }
      } else {
        setBookmarks(initialBookmarks)
        if (initialBookmarks.length > 0) {
          globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBookmarks))
        }
      }
    } catch {
      setBookmarks(initialBookmarks)
    } finally {
      hasLoadedRef.current = true
      setIsLoaded(true)
    }
  }, [initialBookmarks, setBookmarks])

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

  const bookmarkedIds = useMemo(() => localBookmarks.map((item) => item.id), [localBookmarks])

  const isBookmarked = (postId: string) => bookmarksRef.current.some((item) => item.id === postId)

  const toggleBookmark = useCallback(
    async (post: {
      id: string
      title: string
      description?: string | null
      createdAt?: string | Date
      tags?: string[]
    }) => {
      const postId = post.id
      const current = bookmarksRef.current
      const currentlyBookmarked = current.some((item) => item.id === postId)

      // Optimistic local state update
      const updatedList = currentlyBookmarked
        ? current.filter((item) => item.id !== postId)
        : [
            {
              id: postId,
              title: post.title,
              description: post.description ?? null,
              createdAt: post.createdAt
                ? new Date(post.createdAt).toISOString()
                : new Date().toISOString(),
              tags: post.tags ?? []
            },
            ...current
          ]

      setBookmarks(updatedList)
      persistBookmarks(updatedList)
      toast.success(currentlyBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks')

      // If authenticated, sync with database
      if (userId) {
        try {
          await toggleBookmarkAction({ postId })
        } catch {
          // Keep local state functioning
        }
      }
    },
    [setBookmarks, userId]
  )

  const clearBookmarks = useCallback(async () => {
    const cleared = bookmarksRef.current
    setBookmarks([])
    persistBookmarks([])

    if (userId) {
      await Promise.allSettled(cleared.map((item) => toggleBookmarkAction({ postId: item.id })))
    }
  }, [setBookmarks, userId])

  return {
    isLoaded,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    bookmarks: localBookmarks,
    bookmarkCount: bookmarkedIds.length
  }
}
