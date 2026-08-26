'use client'

import type { Editor } from '@tiptap/react'

import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  MinusIcon,
  RemoveFormattingIcon,
  RotateCcwIcon,
  RotateCwIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TerminalSquareIcon,
  UnderlineIcon
} from 'lucide-react'

import { AlignDropdown } from './align-dropdown'
import { ColorPicker } from './color-picker'
import { EmojiPicker } from './emoji-picker'
import { FontFamilyDropdown } from './font-family-dropdown'
import { HeadingDropdown } from './heading-dropdown'
import { ImageDialog } from './image-dialog'
import { LinkDialog } from './link-dialog'
import { ListGroup } from './list-group'
import { TableMenu } from './table-menu'
import { ToolbarButton } from './toolbar-button'
import { ToolbarDivider } from './toolbar-divider'
import { YoutubeDialog } from './youtube-dialog'

type ToolbarProps = {
  editor: Editor
  className?: string
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  return (
    <nav
      className="flex flex-wrap items-center gap-0.5"
      aria-label="Rich text editor toolbar"
    >
      {/* History Actions */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo"
          shortcut="Ctrl+Z"
          icon={<RotateCcwIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo"
          shortcut="Ctrl+Y"
          icon={<RotateCwIcon className="size-4" />}
        />
      </div>

      <ToolbarDivider />

      {/* Typography & Fonts */}
      <div className="flex items-center gap-0.5">
        <HeadingDropdown editor={editor} />
        <FontFamilyDropdown editor={editor} />
      </div>

      <ToolbarDivider />

      {/* Inline Text Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Bold"
          shortcut="Ctrl+B"
          icon={<BoldIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italic"
          shortcut="Ctrl+I"
          icon={<ItalicIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="Underline"
          shortcut="Ctrl+U"
          icon={<UnderlineIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          tooltip="Strikethrough"
          shortcut="Ctrl+Shift+S"
          icon={<StrikethroughIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          tooltip="Inline Code"
          shortcut="Ctrl+E"
          icon={<CodeIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={editor.isActive('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          tooltip="Subscript"
          className="hidden md:inline-flex"
          icon={<SubscriptIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={editor.isActive('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          tooltip="Superscript"
          className="hidden md:inline-flex"
          icon={<SuperscriptIcon className="size-4" />}
        />
        <ColorPicker editor={editor} />
      </div>

      <ToolbarDivider />

      {/* Text Alignment */}
      <AlignDropdown editor={editor} />

      <ToolbarDivider />

      {/* Lists & Quotes */}
      <ListGroup editor={editor} />

      {/* Code Block & Horizontal Rule */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          isActive={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          tooltip="Code Block"
          shortcut="Ctrl+Alt+C"
          icon={<TerminalSquareIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Divider Rule"
          icon={<MinusIcon className="size-4" />}
        />
      </div>

      <ToolbarDivider />

      {/* Media & Embeds */}
      <div className="flex items-center gap-0.5">
        <LinkDialog editor={editor} />
        <ImageDialog editor={editor} />
        <YoutubeDialog editor={editor} />
        <TableMenu editor={editor} />
        <EmojiPicker editor={editor} />
      </div>

      <ToolbarDivider className="hidden sm:block" />

      {/* Clear Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          tooltip="Clear Formatting"
          icon={<RemoveFormattingIcon className="size-4" />}
        />
      </div>
    </nav>
  )
}

export default Toolbar
