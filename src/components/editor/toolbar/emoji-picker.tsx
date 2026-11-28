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

const EMOJI_KEYWORDS: Record<string, string> = {
  '😀': 'grinning smile happy',
  '😃': 'smiley happy',
  '😄': 'smile grin',
  '😁': 'beaming grin',
  '😆': 'laughing grin',
  '😅': 'sweat smile relief',
  '😂': 'joy laugh tears',
  '🤣': 'rofl laughing',
  '😊': 'blush happy',
  '😇': 'angel innocent',
  '🙂': 'slightly smiling',
  '😉': 'wink',
  '😍': 'heart eyes love',
  '🥰': 'hearts love',
  '😘': 'kiss',
  '😋': 'yum delicious',
  '😎': 'cool sunglasses',
  '🤩': 'star struck',
  '🥳': 'party celebrate',
  '🤔': 'thinking hmm',
  '🤫': 'shush quiet',
  '🫡': 'salute respect',
  '🤐': 'zipper quiet',
  '😮': 'surprised wow',
  '🤯': 'mind blown',
  '😭': 'cry sad',
  '😱': 'scream shocked',
  '🔥': 'fire hot lit flame',
  '✨': 'sparkles magic shine',
  '🎉': 'party tada celebrate',
  '👍': 'thumbs up like approve yes',
  '👎': 'thumbs down dislike no',
  '👏': 'clap applause',
  '🙌': 'celebrate praise hands',
  '🤝': 'handshake deal agree',
  '🙏': 'pray thanks please',
  '✌️': 'peace victory',
  '🤞': 'fingers crossed luck',
  '💪': 'muscle strong strength',
  '👀': 'eyes look watch',
  '🧠': 'brain think smart ai',
  '🫶': 'heart hands love',
  '👊': 'fist bump',
  '🤌': 'pinched fingers',
  '🫰': 'finger heart',
  '🤙': 'call me shaka',
  '🖖': 'vulcan spock',
  '👋': 'wave hello bye',
  '🖐️': 'hand five',
  '🚀': 'rocket launch ship deploy',
  '💡': 'bulb idea tip',
  '📌': 'pin pushpin',
  '📎': 'paperclip attach',
  '✏️': 'pencil edit write',
  '📝': 'memo note write',
  '💻': 'laptop computer code dev',
  '📱': 'phone mobile',
  '⌨️': 'keyboard type',
  '🖥️': 'desktop monitor screen',
  '🗄️': 'cabinet server storage',
  '🔌': 'plug plugin connect',
  '⚙️': 'gear settings config',
  '🔧': 'wrench tool fix',
  '🔨': 'hammer build',
  '🧰': 'toolbox tools',
  '📦': 'package box container',
  '🐳': 'whale docker container',
  '☸️': 'wheel kubernetes k8s helm',
  '🛰️': 'satellite space telemetry',
  '⚡': 'lightning bolt fast zap',
  '⭐': 'star favorite',
  '❤️': 'heart love red',
  '💯': 'hundred 100 perfect',
  '✅': 'check done pass success',
  '❌': 'cross error fail x',
  '⚠️': 'warning alert caution',
  '🎯': 'target bullseye goal',
  '📚': 'books docs learn',
  '☕': 'coffee break',
  '🛡️': 'shield security protect',
  '🔓': 'unlock open',
  '🔒': 'lock secure',
  '📈': 'chart up growth metrics',
  '📉': 'chart down',
  '⏱️': 'timer clock latency',
  '🔔': 'bell notify alert',
  '🏆': 'trophy win award',
  '🥇': 'medal first gold',
  '✔️': 'check mark'
}

const matchesEmojiQuery = (emoji: string, categoryName: string, query: string): boolean => {
  if (emoji.includes(query)) return true
  if (categoryName.toLowerCase().includes(query)) return true
  return (EMOJI_KEYWORDS[emoji] ?? '').includes(query)
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
      emojis: cat.emojis.filter((emoji) => matchesEmojiQuery(emoji, cat.name, query))
    })).filter((cat) => cat.emojis.length > 0)
  }, [search])

  const matchedEmoji = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    return filteredCategories.flatMap((cat) => cat.emojis)
  }, [search, filteredCategories])

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
