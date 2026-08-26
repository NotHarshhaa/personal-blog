import {
  type ExtendedRegExpMatchArray,
  InputRule,
  Node,
  type Range,
  ReactNodeViewRenderer,
  type SingleCommands
} from '@tiptap/react'

import { MathNodeView } from './math-node-view'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    math: {
      setMath: (attrs: { latex: string; display?: boolean }) => ReturnType
    }
  }
}

export const MathExtension = Node.create({
  name: 'math',
  group: 'inline',
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') ?? element.dataset.latex ?? '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
          'data-display': attributes.display ? 'true' : 'false'
        })
      },
      display: {
        default: false,
        parseHTML: (element) => (element.getAttribute('data-display') ?? element.dataset.display) === 'true',
        renderHTML: (attributes) => ({
          'data-display': attributes.display ? 'true' : 'false'
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-latex]'
      },
      {
        tag: 'div[data-latex]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const isDisplay = Boolean(node.attrs.display)

    return [
      isDisplay ? 'div' : 'span',
      {
        ...HTMLAttributes,
        class: isDisplay ? 'tiptap-math-block my-4 text-center' : 'tiptap-math inline-block mx-0.5'
      }
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView)
  },

  addCommands() {
    return {
      setMath:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              latex: attrs.latex,
              display: attrs.display ?? false
            }
          })
        }
    }
  },

  addInputRules() {
    return [
      // Double dollar for display block equation: $$formula$$
      new InputRule({
        find: /\$\$([^$]+)\$\$$/,
        handler: ({ range, match, commands }: { range: Range; match: ExtendedRegExpMatchArray; commands: SingleCommands }) => {
          const latex = match[1]?.trim()
          if (!latex) return

          commands.insertContentAt(range, {
            type: this.name,
            attrs: {
              latex,
              display: true
            }
          })
        }
      }),
      // Single dollar for inline equation: $formula$
      new InputRule({
        find: /(?:^|\s)\$([^$]+)\$$/,
        handler: ({ range, match, commands }: { range: Range; match: ExtendedRegExpMatchArray; commands: SingleCommands }) => {
          const latex = match[1]?.trim()
          if (!latex) return

          commands.insertContentAt(range, {
            type: this.name,
            attrs: {
              latex,
              display: false
            }
          })
        }
      })
    ]
  }
})
