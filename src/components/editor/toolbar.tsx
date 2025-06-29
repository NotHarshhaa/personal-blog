import { type Editor } from '@tiptap/react'
import { cn } from '@/lib/utils'
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ItalicIcon,
  LayoutListIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  RemoveFormattingIcon,
  RotateCcwIcon,
  RotateCwIcon,
  StrikethroughIcon,
  TerminalSquareIcon,
  TextQuoteIcon,
  SmileIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  TypeIcon,
  PaletteIcon,
  YoutubeIcon
} from 'lucide-react'
import { useCallback } from 'react'

// Simple tooltip
const Tooltip = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <span className='group relative'>
    {children}
    <span className='pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 scale-95 rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow transition-all group-hover:opacity-100 group-focus-within:opacity-100'>
      {label}
    </span>
  </span>
)

type ToolbarProps = {
  editor: Editor
}

const Divider = () => <div className='bg-muted mx-2 h-6 w-[2px] md:block hidden' />

// Mobile toolbar row breakpoint helper
const MobileBreak = () => <div className='w-full h-0 md:hidden block order-3' />

const Toolbar = (props: ToolbarProps) => {
  const { editor } = props

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = globalThis.prompt('URL', previousUrl as string)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addEmoji = () => {
    const emoji = globalThis.prompt('Enter emoji')
    if (emoji) {
      editor.chain().focus().insertContent(emoji).run()
    }
  }

  const setYoutubeVideo = () => {
    const url = globalThis.prompt('Enter YouTube URL')
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const setTextColor = () => {
    const color = globalThis.prompt('Enter color (hex, rgb, or name)', editor.getAttributes('textStyle').color)
    if (color === null) return
    if (color === '') {
      editor.chain().focus().unsetColor().run()
      return
    }
    editor.chain().focus().setColor(color).run()
  }

  const setFontFamily = () => {
    const font = globalThis.prompt('Enter font family', editor.getAttributes('textStyle').fontFamily)
    if (font === null) return
    if (font === '') {
      editor.chain().focus().unsetFontFamily().run()
      return
    }
    editor.chain().focus().setFontFamily(font).run()
  }

  return (
    <nav
      className={cn(
        'backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/70',
        'sticky top-[60px] z-10 flex flex-wrap items-center justify-center md:justify-start rounded-xl border border-border/30 shadow-lg',
        'p-1 md:p-2 gap-0.5 md:gap-1'
      )}
      aria-label='Editor toolbar'
    >
      {/* Text formatting group */}
      <div className='flex items-center gap-0.5 md:gap-1'>
        <Tooltip label='Bold (Ctrl+B)'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              'rounded-lg p-1 md:p-2 transition-all focus-visible:ring-2',
              editor.isActive('bold') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Bold'
          >
            <BoldIcon className='size-4 md:size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Italic (Ctrl+I)'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              'rounded-lg p-1 md:p-2 transition-all focus-visible:ring-2',
              editor.isActive('italic') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Italic'
          >
            <ItalicIcon className='size-4 md:size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Strikethrough (Ctrl+Shift+S)'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              'rounded-lg p-1 md:p-2 transition-all focus-visible:ring-2',
              editor.isActive('strike') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Strikethrough'
          >
            <StrikethroughIcon className='size-4 md:size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Code (Ctrl+E)'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={cn(
              'rounded-lg p-1 md:p-2 transition-all focus-visible:ring-2',
              editor.isActive('code') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Code'
          >
            <CodeIcon className='size-4 md:size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Highlight'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            className={cn(
              'rounded-lg p-1 md:p-2 transition-all focus-visible:ring-2',
              editor.isActive('highlight') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Highlight'
          >
            <HighlighterIcon className='size-4 md:size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Emoji'>
          <button
            type='button'
            onClick={addEmoji}
            className='rounded-lg p-1 md:p-2 transition-all hover:bg-muted focus-visible:ring-2 outline-none md:block hidden'
            aria-label='Add Emoji'
          >
            <SmileIcon className='size-4 md:size-5' />
          </button>
        </Tooltip>
      </div>
      <Divider />
      {/* Text alignment group */}
      <div className='flex items-center gap-0.5 md:gap-1'>
        <Tooltip label='Align Left'>
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Align Left'
          >
            <AlignLeftIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Align Center'>
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Align Center'
          >
            <AlignCenterIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Align Right'>
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Align Right'
          >
            <AlignRightIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Justify'>
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Justify'
          >
            <AlignJustifyIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
      <Divider />
      {/* Text styling group */}
      <div className='flex items-center gap-0.5 md:gap-1'>
        <Tooltip label='Font Family'>
          <button
            type='button'
            onClick={setFontFamily}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('textStyle') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Font Family'
          >
            <TypeIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Text Color'>
          <button
            type='button'
            onClick={setTextColor}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('textStyle') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Text Color'
          >
            <PaletteIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
      <Divider />
      {/* Media group */}
      <div className='flex items-center gap-0.5 md:gap-1'>
        <Tooltip label='YouTube Video'>
          <button
            type='button'
            onClick={setYoutubeVideo}
            className='rounded-lg p-2 transition-all hover:bg-muted focus-visible:ring-2 outline-none'
            aria-label='Add YouTube Video'
          >
            <YoutubeIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
      <Divider />
      {/* Headings and paragraph */}
      <div className='flex items-center gap-0.5 md:gap-1 order-first md:order-none w-full md:w-auto mb-1 md:mb-0'>
        <Tooltip label='Heading 1'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('heading', { level: 1 }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Heading 1'
          >
            <Heading1Icon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Heading 2'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('heading', { level: 2 }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Heading 2'
          >
            <Heading2Icon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Heading 3'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('heading', { level: 3 }) ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Heading 3'
          >
            <Heading3Icon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Paragraph'>
          <button
            type='button'
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('paragraph') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Paragraph'
          >
            <PilcrowIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
      <Divider />
      {/* Lists and code block */}
      <div className='flex items-center gap-0.5 md:gap-1 order-2 md:order-none'>
        <Tooltip label='Bullet List'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('bulletList') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Bullet List'
          >
            <ListIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Ordered List'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('orderedList') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Ordered List'
          >
            <ListOrderedIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Task List'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('taskList') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Task List'
          >
            <LayoutListIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Code Block'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('codeBlock') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Code Block'
          >
            <TerminalSquareIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
      <MobileBreak />
      <Divider />
      {/* Links, quotes, rules, clear formatting */}
      <div className='flex items-center gap-0.5 md:gap-1'>
        <Tooltip label='Link'>
          <button
            type='button'
            onClick={() => setLink()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('link') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Link'
          >
            <LinkIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Blockquote'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              'rounded-lg p-2 transition-all focus-visible:ring-2',
              editor.isActive('blockquote') ? 'bg-muted' : 'hover:bg-muted',
              'outline-none'
            )}
            aria-label='Blockquote'
          >
            <TextQuoteIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Horizontal Rule'>
          <button
            type='button'
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className='rounded-lg p-2 transition-all hover:bg-muted focus-visible:ring-2 outline-none'
            aria-label='Horizontal Rule'
          >
            <MinusIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Clear Formatting'>
          <button
            type='button'
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className='rounded-lg p-2 transition-all hover:bg-muted focus-visible:ring-2 outline-none'
            aria-label='Clear Formatting'
          >
            <RemoveFormattingIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
      <Divider />
      {/* Undo/Redo */}
      <div className='flex items-center gap-0.5 md:gap-1 order-last'>
        <Tooltip label='Undo (Ctrl+Z)'>
          <button
            type='button'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className='rounded-lg p-2 transition-all hover:bg-muted focus-visible:ring-2 outline-none'
            aria-label='Undo'
          >
            <RotateCcwIcon className='size-5' />
          </button>
        </Tooltip>
        <Tooltip label='Redo (Ctrl+Y)'>
          <button
            type='button'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className='rounded-lg p-2 transition-all hover:bg-muted focus-visible:ring-2 outline-none'
            aria-label='Redo'
          >
            <RotateCwIcon className='size-5' />
          </button>
        </Tooltip>
      </div>
    </nav>
  )
}

export default Toolbar
