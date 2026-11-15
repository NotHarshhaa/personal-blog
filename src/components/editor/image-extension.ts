import { Image as BaseImage } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ImageNodeView } from './image-node-view'

export const CustomImage = BaseImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image"] img[src]'
      },
      {
        tag: 'img[src]'
      }
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const titleAttr = (node.attrs.title as string | null) ?? null
    const altAttr = (node.attrs.alt as string | null) ?? null
    const caption = titleAttr ?? altAttr ?? ''
    const srcAttr = (node.attrs.src as string | null) ?? ''

    if (caption) {
      return [
        'figure',
        { class: 'image-figure my-6 text-center', 'data-type': 'image' },
        [
          'img',
          {
            ...HTMLAttributes,
            class: 'rounded-2xl border border-border max-w-full mx-auto cursor-zoom-in shadow-sm',
            src: srcAttr,
            alt: altAttr ?? caption,
            title: caption
          }
        ],
        [
          'figcaption',
          { class: 'mt-2.5 text-center font-sans text-xs italic text-muted-foreground sm:text-sm' },
          caption
        ]
      ]
    }

    return [
      'img',
      {
        ...HTMLAttributes,
        class: 'rounded-2xl border border-border max-w-full mx-auto my-6 cursor-zoom-in shadow-sm',
        src: srcAttr,
        alt: altAttr ?? '',
        title: titleAttr ?? ''
      }
    ]
  }
})
