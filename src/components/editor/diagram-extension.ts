import {
  type ExtendedRegExpMatchArray,
  InputRule,
  Node,
  type Range,
  ReactNodeViewRenderer,
  type SingleCommands
} from '@tiptap/react'

import { DEFAULT_DIAGRAM_TEMPLATE, DiagramNodeView } from './diagram-node-view'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    diagram: {
      setDiagram: (attrs?: { code?: string; caption?: string }) => ReturnType
    }
  }
}

export const DiagramExtension = Node.create({
  name: 'diagram',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      code: {
        default: DEFAULT_DIAGRAM_TEMPLATE,
        parseHTML: (element) => element.dataset.code ?? DEFAULT_DIAGRAM_TEMPLATE,
        renderHTML: (attributes) => ({
          'data-code': attributes.code as string,
          'data-type': 'diagram'
        })
      },
      caption: {
        default: '',
        parseHTML: (element) => element.dataset.caption ?? '',
        renderHTML: (attributes) => ({
          'data-caption': (attributes.caption as string) || ''
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="diagram"]'
      },
      {
        tag: 'figure[data-type="diagram"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'diagram',
        class: 'tiptap-diagram-blueprint my-6 w-full not-prose'
      }
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramNodeView)
  },

  addCommands() {
    return {
      setDiagram:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              code: attrs?.code ?? DEFAULT_DIAGRAM_TEMPLATE,
              caption: attrs?.caption ?? ''
            }
          })
        }
    }
  },

  addInputRules() {
    return [
      // Trigger via typing $$mermaid or $$diagram at the start of a block
      new InputRule({
        find: /^\$\$(?:mermaid|diagram)\s$/,
        handler: ({
          range,
          commands
        }: {
          range: Range
          match: ExtendedRegExpMatchArray
          commands: SingleCommands
        }) => {
          commands.insertContentAt(range, {
            type: this.name,
            attrs: {
              code: DEFAULT_DIAGRAM_TEMPLATE,
              caption: 'Architecture Blueprint'
            }
          })
        }
      })
    ]
  }
})

export default DiagramExtension
