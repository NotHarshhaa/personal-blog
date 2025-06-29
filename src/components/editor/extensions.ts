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
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import { Youtube } from '@tiptap/extension-youtube'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { all, createLowlight } from 'lowlight'

const lowlight = createLowlight(all)

export const extensions: AnyExtension[] = [
  StarterKit.configure({
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    hardBreak: false,
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {
        class: 'font-bold tracking-tight',
        level: {
          1: 'text-4xl mt-8 mb-4',
          2: 'text-3xl mt-6 mb-3',
          3: 'text-2xl mt-4 mb-2',
          4: 'text-xl mt-3 mb-2',
          5: 'text-lg mt-2 mb-1',
          6: 'text-base mt-2 mb-1'
        }
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc list-outside ml-4 space-y-1',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal list-outside ml-4 space-y-1',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'pl-1',
      },
    },
  }),

  // Text styling
  TextStyle,
  Color,
  FontFamily,
  Typography,
  TextAlign.configure({
    types: ['heading', 'paragraph', 'blockquote'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),

  // Inline formatting
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: 'rounded px-0.5',
    },
  }),
  Underline,
  Subscript,
  Superscript,

  // Lists and tasks
  TaskList.configure({
    HTMLAttributes: {
      class: 'not-prose pl-2',
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'flex items-start gap-1 my-1',
    },
  }),

  // Placeholder
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return "What's the title?"
      }
      return 'Start writing or press "/" for commands...'
    },
    includeChildren: true,
  }),

  // Links
  Link.configure({
    openOnClick: true,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      rel: 'noopener noreferrer nofollow',
      target: '_blank',
      class: 'underline decoration-primary/30 underline-offset-2 text-primary hover:text-primary/80 transition-colors',
    },
  }).extend({
    inclusive: false,
    priority: 100,
  }),

  // Code blocks
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'plaintext',
    HTMLAttributes: {
      class: 'not-prose rounded-xl border border-border/40 bg-muted/30 shadow-sm',
    },
    languageClassPrefix: 'language-',
  }),

  // Media
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'rounded-xl border border-border/40 max-w-full mx-auto my-6 shadow-lg transition-shadow hover:shadow-xl',
    },
  }),
  Youtube.configure({
    inline: false,
    HTMLAttributes: {
      class: 'rounded-xl border border-border/40 max-w-full mx-auto my-6 shadow-lg aspect-video',
    },
  }),

  // Tables
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'my-6 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'border-b border-border/20 last:border-0',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border-r border-border/20 last:border-0 p-2',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border-r border-border/20 last:border-0 p-2 font-semibold bg-muted/30',
    },
  }),

  // Decorative elements
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'my-8 border-t-2 border-dashed border-border/40',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-primary/40 pl-6 italic my-6 text-muted-foreground',
    },
  }),

  // Utilities
  HardBreak,
  Dropcursor.configure({
    color: 'var(--primary)',
    width: 2,
  }),
  Gapcursor,
  Focus.configure({
    className: 'ring-1 ring-primary/5 rounded',
    mode: 'shallowest'
  }),
]
