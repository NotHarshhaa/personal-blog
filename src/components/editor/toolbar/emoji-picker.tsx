import type { Editor } from '@tiptap/react'

import { SmileIcon } from 'lucide-react'

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
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '🤔', '🤫', '🫡', '🤐', '😮', '🤯', '😭', '😱', '🔥', '✨', '🎉']
  },
  {
    name: 'Gestures & Objects',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '🙏', '✌️', '🤞', '💪', '🚀', '💡', '📌', '📎', '✏️', '📝', '💻', '📱', '⚡', '⭐', '❤️', '💯', '✅', '❌', '⚠️', '🎯', '📚', '☕', '🧠', '🛡️', '📦']
  }
]

export const EmojiPicker = ({ editor }: EmojiPickerProps) => {
  const handleSelectEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors select-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
          aria-label="Insert emoji"
        >
          <SmileIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-2">
        <div className="space-y-2">
          {EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
                {cat.name}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className="flex size-7 items-center justify-center rounded text-base transition-transform hover:scale-125 hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
