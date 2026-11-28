'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { clearBookmarksAction, toggleBookmarkAction } from '@/actions/toggle-bookmark-action'

export type LocalBookmark = {
  id: string
  title: string
  description?: string | null
  createdAt: string
  tags?: string[]
}

const STORAGE_KEY_PREFIX = 'blog_bookmarks_v1'
const EMPTY_BOOKMARKS: LocalBookmark[] = []

const getStorageKey = (userId?: string | null) =>
  userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX

const persistBookmarks = (storageKey: string, next: LocalBookmark[]) => {
  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(next))
    globalThis.dispatchEvent(new Event('bookmarks-updated'))
  } catch {
    // storage quota error ignore
  }
}

export const useBookmarks = (
  userId?: string | null,
  initialBookmarks: LocalBookmark[] = EMPTY_BOOKMARKS
) => {
  const storageKey = getStorageKey(userId)
  const [localBookmarks, setLocalBookmarks] = useState<LocalBookmark[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  // Ref mirror of localBookmarks so rapid successive toggles always read
  // the freshest list instead of a stale render-time snapshot.
  const bookmarksRef = useRef<LocalBookmark[]>([])
  const hasLoadedForKeyRef = useRef<string | null>(null)

  const setBookmarks = useCallback((next: LocalBookmark[]) => {
    bookmarksRef.current = next
    setLocalBookmarks(next)
  }, [])

  // Load from localStorage
  const reloadFromStorage = useCallback(() => {
    const firstLoadForKey = hasLoadedForKeyRef.current !== storageKey
    try {
      const raw = globalThis.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as LocalBookmark[]
        const bookmarks = firstLoadForKey
          ? Array.from(
              new Map([...parsed, ...initialBookmarks].map((item) => [item.id, item])).values()
            )
          : parsed
        setBookmarks(bookmarks)
        if (firstLoadForKey && initialBookmarks.length > 0) {
          globalThis.localStorage.setItem(storageKey, JSON.stringify(bookmarks))
        }
      } else {
        setBookmarks(initialBookmarks)
        if (initialBookmarks.length > 0) {
          globalThis.localStorage.setItem(storageKey, JSON.stringify(initialBookmarks))
        }
      }
    } catch {
      setBookmarks(initialBookmarks)
    } finally {
      hasLoadedForKeyRef.current = storageKey
      setIsLoaded(true)
    }
  }, [initialBookmarks, setBookmarks, storageKey])

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

  const isBookmarked = useCallback(
    (postId: string) => localBookmarks.some((item) => item.id === postId),
    [localBookmarks]
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
      const current = bookmarksRef.current
      const currentlyBookmarked = current.some((item) => item.id === postId)
      const nextState = !currentlyBookmarked

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
      persistBookmarks(storageKey, updatedList)
      toast.success(currentlyBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks')

      // If authenticated, sync explicit target state with database
      if (userId) {
        try {
          const res = await toggleBookmarkAction({ postId, bookmarked: nextState })
          if (res?.serverError) {
            setBookmarks(current)
            persistBookmarks(storageKey, current)
            toast.error(res.serverError)
          }
        } catch {
          // Keep local state functioning on offline/transient error
        }
      }
    },
    [setBookmarks, storageKey, userId]
  )

  const clearBookmarks = useCallback(async () => {
    const previous = bookmarksRef.current
    setBookmarks([])
    persistBookmarks(storageKey, [])

    if (userId) {
      const res = await clearBookmarksAction()
      if (res?.serverError) {
        setBookmarks(previous)
        persistBookmarks(storageKey, previous)
        toast.error(res.serverError)
      }
    }
  }, [setBookmarks, storageKey, userId])

  return {
    isLoaded,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    bookmarks: localBookmarks,
    bookmarkCount: bookmarkedIds.length
  }
}
