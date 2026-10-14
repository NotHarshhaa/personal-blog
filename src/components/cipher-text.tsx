'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const CIPHER_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>/{}[]='

type CipherTextProps = {
  children?: ReactNode
  text?: string
  duration?: number
  scrambleOnHover?: boolean
  scrambleOnMount?: boolean
  className?: string
}

export const CipherText = ({
  children,
  text,
  duration = 850,
  scrambleOnHover = true,
  scrambleOnMount = false,
  className
}: CipherTextProps) => {
  const originalText = String(text ?? children ?? '')
  const [displayText, setDisplayText] = useState(originalText)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scramble = () => {
    if (!originalText) return
    let frame = 0
    const intervalMs = 40
    const totalFrames = Math.max(1, Math.ceil(duration / intervalMs))

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      frame += 1
      const progress = frame / totalFrames

      const nextText = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '

          const lockProgress = index / originalText.length

          // Once progress surpasses the character's relative position, reveal it
          if (progress >= lockProgress + 0.15) {
            return char
          }

          return CIPHER_CHARACTERS[
            Math.floor(Math.random() * CIPHER_CHARACTERS.length)
          ]
        })
        .join('')

      setDisplayText(nextText)

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(originalText)
      }
    }, intervalMs)
  }

  useEffect(() => {
    setDisplayText(originalText)
    if (scrambleOnMount) {
      scramble()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [originalText, scrambleOnMount])

  return (
    <span
      className={className}
      onMouseEnter={scrambleOnHover ? scramble : undefined}
    >
      {displayText}
    </span>
  )
}

export default CipherText
