'use client'

import { useEffect, useState } from 'react'

const ReadingProgress = () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const updateProgress = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight - windowHeight
            const scrollTop = window.scrollY
            const progress = Math.min((scrollTop / documentHeight) * 100, 100)
            setProgress(progress)
        }

        window.addEventListener('scroll', updateProgress, { passive: true })
        updateProgress() // Initial calculation

        return () => window.removeEventListener('scroll', updateProgress)
    }, [])

    if (progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/20">
            <div
                className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
            />
        </div>
    )
}

export default ReadingProgress

