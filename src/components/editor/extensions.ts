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
    // Configured separately below — avoid duplicate keyed plugins
    dropcursor: false,
    gapcursor: false,
    code: {
      HTMLAttributes: {
        class:
          'rounded-none border border-border bg-muted px-1 py-0.5 font-mono text-[0.875em] text-foreground',
      },
    },
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
      class: 'rounded-none bg-foreground/10 px-0.5',
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
      class:
        'underline decoration-foreground/30 underline-offset-2 text-foreground hover:decoration-foreground transition-colors',
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
      class:
        'not-prose relative my-5 overflow-x-auto rounded-none border border-border bg-muted font-mono text-[13px] leading-relaxed shadow-none',
    },
    languageClassPrefix: 'language-',
  }),

  // Media
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class:
        'rounded-none border border-border max-w-full mx-auto my-6 shadow-none',
    },
  }),
  Youtube.configure({
    inline: false,
    HTMLAttributes: {
      class:
        'rounded-none border border-border max-w-full mx-auto my-6 shadow-none aspect-video',
    },
  }),

  // Tables
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'my-6 w-full border border-border rounded-none overflow-hidden shadow-none',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'border-b border-border last:border-0',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border-r border-border last:border-0 p-2',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class:
        'border-r border-border last:border-0 p-2 font-semibold bg-muted',
    },
  }),

  // Decorative elements
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'my-8 border-t border-dashed border-border',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class:
        'border-l-2 border-foreground pl-5 my-6 text-muted-foreground not-italic',
    },
  }),

  // Utilities
  HardBreak,
  Dropcursor.configure({
    color: 'var(--foreground)',
    width: 2,
  }),
  Gapcursor,
  Focus.configure({
    className: 'ring-1 ring-foreground/15 rounded-none',
    mode: 'shallowest',
  }),
]
