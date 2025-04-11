'use client'

import dynamic from 'next/dynamic'

// Lazy-load NewPostButton so it doesn't run during server render
const NewPostButton = dynamic(() => import('./new-post-button'), { ssr: false })

export default NewPostButton
