import type { Editor } from '@tiptap/react'

import {
  CheckSquareIcon,
  ListIcon,
  ListOrderedIcon,
  TextQuoteIcon
} from 'lucide-react'

import { ToolbarButton } from './toolbar-button'

type ListGroupProps = {
  editor: Editor
}

export const ListGroup = ({ editor }: ListGroupProps) => {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        tooltip="Bullet List"
        shortcut="Ctrl+Shift+8"
        icon={<ListIcon className="size-4" />}
      />
      <ToolbarButton
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        tooltip="Numbered List"
        shortcut="Ctrl+Shift+7"
        icon={<ListOrderedIcon className="size-4" />}
      />
      <ToolbarButton
        isActive={editor.isActive('taskList')}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        tooltip="Task List"
        shortcut="Ctrl+Shift+9"
        icon={<CheckSquareIcon className="size-4" />}
      />
      <ToolbarButton
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        tooltip="Blockquote"
        shortcut="Ctrl+Shift+B"
        icon={<TextQuoteIcon className="size-4" />}
      />
    </div>
  )
}
