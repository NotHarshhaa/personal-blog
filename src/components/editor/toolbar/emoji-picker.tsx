import type { Editor } from '@tiptap/react'

import { ClockIcon, SearchIcon, SmileIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type EmojiPickerProps = {
  editor: Editor
}

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys & Reactions',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '😂',
      '🤣',
      '😊',
      '😇',
      '🙂',
      '😉',
      '😍',
      '🥰',
      '😘',
      '😋',
      '😎',
      '🤩',
      '🥳',
      '🤔',
      '🤫',
      '🫡',
      '🤐',
      '😮',
      '🤯',
      '😭',
      '😱',
      '🔥',
      '✨',
      '🎉'
    ]
  },
  {
    name: 'Gestures & People',
    emojis: [
      '👍',
      '👎',
      '👏',
      '🙌',
      '🤝',
      '🙏',
      '✌️',
      '🤞',
      '💪',
      '🫡',
      '👀',
      '🧠',
      '🫶',
      '👊',
      '🤌',
      '🫰',
      '🤙',
      '🖖',
      '👋',
      '🖐️'
    ]
  },
  {
    name: 'DevOps & Objects',
    emojis: [
      '🚀',
      '💡',
      '📌',
      '📎',
      '✏️',
      '📝',
      '💻',
      '📱',
      '⌨️',
      '🖥️',
      '🗄️',
      '🔌',
      '⚙️',
      '🔧',
      '🔨',
      '🧰',
      '📦',
      '🐳',
      '☸️',
      '🛰️'
    ]
  },
  {
    name: 'Status & Symbols',
    emojis: [
      '⚡',
      '⭐',
      '❤️',
      '💯',
      '✅',
      '❌',
      '⚠️',
      '🎯',
      '📚',
      '☕',
      '🛡️',
      '🔓',
      '🔒',
      '📈',
      '📉',
      '⏱️',
      '🔔',
      '🏆',
      '🥇',
      '✔️'
    ]
  }
]

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((cat) => cat.emojis)

const RECENTS_KEY = 'editor_recent_emojis_v1'
const MAX_RECENTS = 10

const loadRecents = (): string[] => {
  try {
    const stored = globalThis.localStorage.getItem(RECENTS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((e): e is string => typeof e === 'string').slice(0, MAX_RECENTS)
      : []
  } catch {
    return []
  }
}

export const EmojiPicker = ({ editor }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setRecents(loadRecents())
    } else {
      setSearch('')
    }
  }, [isOpen])

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return EMOJI_CATEGORIES
    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter((emoji) => emoji.includes(query))
    })).filter((cat) => cat.emojis.length > 0)
  }, [search])

  const matchedEmoji = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    return ALL_EMOJIS.filter((emoji) => emoji.includes(query))
  }, [search])

  const handleSelectEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()

    setRecents((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, MAX_RECENTS)
      try {
        globalThis.localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex size-8 items-center justify-center transition-colors select-none focus-visible:ring-1 focus-visible:outline-hidden'
          aria-label='Insert emoji'
        >
          <SmileIcon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-72 p-2'>
        {/* Search */}
        <div className='relative mb-2'>
          <SearchIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2' />
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search emojis...'
            aria-label='Search emojis'
            className='border-border bg-background focus:border-foreground h-7.5 w-full border pr-7 pl-8 font-mono text-xs transition-colors outline-none'
          />
          {search && (
            <button
              type='button'
              onClick={() => setSearch('')}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer'
              aria-label='Clear emoji search'
            >
              <XIcon className='size-3' />
            </button>
          )}
        </div>

        <div className='max-h-64 space-y-2 overflow-y-auto'>
          {/* Recently used */}
          {!search && recents.length > 0 && (
            <div>
              <div className='text-muted-foreground mb-1 flex items-center gap-1 text-[11px] font-semibold'>
                <ClockIcon className='size-3' aria-hidden />
                <span>Recently used</span>
              </div>
              <div className='grid grid-cols-8 gap-1'>
                {recents.map((emoji) => (
                  <button
                    key={`recent-${emoji}`}
                    type='button'
                    onClick={() => handleSelectEmoji(emoji)}
                    className='hover:bg-muted flex size-7 items-center justify-center text-base transition-transform hover:scale-125'
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {search && matchedEmoji.length === 0 ? (
            <p className='text-muted-foreground px-1 py-6 text-center font-mono text-xs'>
              No emojis found for &quot;{search}&quot;
            </p>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.name}>
                <div className='text-muted-foreground mb-1 text-[11px] font-semibold'>
                  {search ? `${cat.name} (${cat.emojis.length})` : cat.name}
                </div>
                <div className='grid grid-cols-8 gap-1'>
                  {cat.emojis.map((emoji) => (
                    <button
                      key={`${cat.name}-${emoji}`}
                      type='button'
                      onClick={() => handleSelectEmoji(emoji)}
                      className='hover:bg-muted flex size-7 items-center justify-center text-base transition-transform hover:scale-125'
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
