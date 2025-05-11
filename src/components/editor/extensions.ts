import type { AnyExtension } from '@tiptap/react'

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Blockquote } from '@tiptap/extension-blockquote'
import { HardBreak } from '@tiptap/extension-hard-break'
import { all, createLowlight } from 'lowlight'

const lowlight = createLowlight(all)

export const extensions: AnyExtension[] = [
  StarterKit.configure({
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    hardBreak: false,
  }),
  Highlight,
  Underline,
  Subscript,
  Superscript,
  TaskList,
  TaskItem.configure({
    nested: true
  }),
  Placeholder.configure({
    placeholder: 'Write something amazing...'
  }),
  Link.configure({
    openOnClick: true,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      rel: 'noopener noreferrer nofollow',
      target: '_blank',
      class: 'underline text-primary hover:text-primary/80 transition-colors',
    }
  }).extend({
    inclusive: false,
    priority: 100
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'plaintext',
    HTMLAttributes: {
      class: 'p-3 not-prose bg-secondary/50 rounded-lg border my-6'
    }
  }),
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'rounded-lg border max-w-full mx-auto my-4 shadow'
    }
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'my-4 border rounded-lg overflow-auto'
    }
  }),
  TableRow,
  TableCell,
  TableHeader,
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'my-6 border-t-2 border-dashed border-muted'
    }
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-primary/40 pl-4 italic my-4 text-muted-foreground'
    }
  }),
  HardBreak,
]
