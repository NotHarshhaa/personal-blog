import { Blockquote } from '@tiptap/extension-blockquote'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Color } from '@tiptap/extension-color'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import { FontFamily } from '@tiptap/extension-font-family'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Highlight } from '@tiptap/extension-highlight'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Typography } from '@tiptap/extension-typography'
import { Underline } from '@tiptap/extension-underline'
import { Youtube } from '@tiptap/extension-youtube'
import {
  type AnyExtension,
  ReactNodeViewRenderer
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { all, createLowlight } from 'lowlight'

import { CodeBlockNodeView } from './code-block-node-view'
import { MathExtension } from './math-extension'

const lowlight = createLowlight(all)

export const extensions: AnyExtension[] = [
  StarterKit.configure({
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    hardBreak: false,
    dropcursor: false,
    gapcursor: false,
    code: {
      HTMLAttributes: {
        class:
          'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground',
      },
    },
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {
        class: 'font-bold tracking-tight',
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

  // Mathematics (KaTeX / LaTeX)
  MathExtension,

  // Text Styling & Typography
  TextStyle,
  Color,
  FontFamily,
  Typography,
  TextAlign.configure({
    types: ['heading', 'paragraph', 'blockquote'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),

  // Inline Formatting
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: 'rounded-sm bg-yellow-200/40 dark:bg-yellow-500/30 px-1 py-0.5',
    },
  }),
  Underline,
  Subscript,
  Superscript,

  // Lists & Tasks
  TaskList.configure({
    HTMLAttributes: {
      class: 'not-prose pl-0 space-y-1 my-3',
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'flex items-start gap-2 my-1',
    },
  }),

  // Placeholder
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return "Heading..."
      }
      return 'Start writing your story, notes, or math formulas...'
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
        'underline decoration-foreground/40 underline-offset-3 text-primary hover:decoration-foreground transition-colors font-medium',
    },
  }).extend({
    inclusive: false,
    priority: 100,
  }),

  // Syntax-Highlighted Interactive Code Blocks
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockNodeView)
    },
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          if (this.editor.isActive('codeBlock')) {
            return this.editor.commands.insertContent('  ')
          }
          return false
        }
      }
    }
  }).configure({
    lowlight,
    defaultLanguage: 'plaintext',
    HTMLAttributes: {
      class: 'not-prose relative my-5 overflow-hidden rounded-lg border border-border bg-muted/40 font-mono text-[13px]',
    },
    languageClassPrefix: 'language-',
  }),

  // Media (Images & YouTube)
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'rounded-md border border-border max-w-full mx-auto my-6 shadow-sm',
    },
  }),
  Youtube.configure({
    inline: false,
    HTMLAttributes: {
      class: 'rounded-md border border-border max-w-full mx-auto my-6 aspect-video shadow-sm',
    },
  }),

  // Tables
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'my-6 w-full border-collapse border border-border rounded-md overflow-hidden shadow-xs',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'border-b border-border last:border-0',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border-r border-border last:border-0 p-2.5 align-top text-sm',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border-r border-border last:border-0 p-2.5 font-semibold bg-muted/80 text-left text-sm',
    },
  }),

  // Block Dividers & Quotes
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'my-8 border-t border-border',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-primary pl-4 my-6 text-muted-foreground italic',
    },
  }),

  // Editor Utilities
  HardBreak,
  Dropcursor.configure({
    color: 'var(--primary)',
    width: 2,
  }),
  Gapcursor,
  Focus.configure({
    className: 'ring-1 ring-primary/20 rounded-sm',
    mode: 'shallowest',
  }),
]
