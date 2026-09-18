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
import { Markdown } from 'tiptap-markdown'

import { CodeBlockNodeView } from './code-block-node-view'
import { MathExtension } from './math-extension'

const lowlight = createLowlight(all)

/**
 * Detects if content is already structured HTML rather than raw markdown text.
 * When posts are stored or passed as HTML (e.g. from the database or editor.getHTML()),
 * running markdown-it's parser over them breaks <pre><code> blocks containing blank lines,
 * because markdown-it terminates HTML blocks on blank lines (\n\n).
 */
const isHtmlContent = (content: unknown): boolean => {
  if (typeof content !== 'string') return false
  const trimmed = content.trim()
  if (!trimmed) return false
  return (
    (trimmed.startsWith('<') && trimmed.endsWith('>')) ||
    /^<(!DOCTYPE|html|head|body|p|div|h[1-6]|ul|ol|li|pre|blockquote|table|section|article|span|code|a|strong|em|img)/i.test(
      trimmed
    )
  )
}

const SafeMarkdown = Markdown.extend({
  onBeforeCreate() {
    this.parent?.()
    const storage = this.editor.storage as Record<string, any>
    if (storage?.markdown?.parser) {
      const origParse = storage.markdown.parser.parse.bind(storage.markdown.parser)
      storage.markdown.parser.parse = (content: any, options: any) => {
        if (isHtmlContent(content)) {
          return content
        }
        return origParse(content, options)
      }
    }
    // If the initial content was HTML, restore it so markdown-it's parser does not corrupt it
    const editorOptions = this.editor.options as Record<string, any>
    if (
      editorOptions.initialContent &&
      isHtmlContent(editorOptions.initialContent)
    ) {
      this.editor.options.content = editorOptions.initialContent
    }
  }
})

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
    addAttributes() {
      return {
        ...this.parent?.(),
        filename: {
          default: null,
          parseHTML: (element) => element.dataset.filename ?? null,
          renderHTML: (attributes) => {
            if (!attributes.filename) {
              return {}
            }
            return {
              'data-filename': attributes.filename as string
            }
          }
        },
        showLineNumbers: {
          default: true,
          parseHTML: (element) => element.dataset.lineNumbers !== 'false',
          renderHTML: (attributes) => {
            return {
              'data-line-numbers': attributes.showLineNumbers ? 'true' : 'false'
            }
          }
        }
      }
    },
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
      class: 'not-prose code-block-blueprint relative my-6 w-full border border-border bg-card font-mono text-[13px]',
    },
    languageClassPrefix: 'language-',
  }),

  // Media (Images & YouTube)
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'border border-border max-w-full mx-auto my-6',
    },
  }),
  Youtube.configure({
    inline: false,
    HTMLAttributes: {
      class: 'border border-border max-w-full mx-auto my-6 aspect-video',
    },
  }),

  // Tables
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'my-6 w-full border-collapse border border-border overflow-hidden',
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
    className: 'ring-1 ring-primary/20',
    mode: 'shallowest',
  }),

  // Markdown Paste & Formatting Support with HTML safety guard
  SafeMarkdown.configure({
    html: true,
    tightLists: true,
    tightListClass: 'normal',
    bulletListMarker: '-',
    linkify: true,
    breaks: false,
    transformPastedText: true,
    transformCopiedText: false,
  }),
]
