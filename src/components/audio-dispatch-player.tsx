'use client'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  FastForwardIcon,
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  Volume2Icon,
  VolumeXIcon
} from 'lucide-react'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { CornerBrackets } from '@/components/frame'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

type AudioDispatchContextType = {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  isMuted: boolean
  isDeepDive: boolean
  togglePlay: () => void
  seek: (percentage: number) => void
  skip: (seconds: number) => void
  setRate: (rate: number) => void
  toggleMute: () => void
  waveformHeights: number[]
  title: string
  minutes: number
  audioAvailable: boolean
}

const AudioDispatchContext = createContext<AudioDispatchContextType | null>(null)
AudioDispatchContext.displayName = 'AudioDispatchContext'

export function useAudioDispatch() {
  const context = use(AudioDispatchContext)
  if (!context) {
    throw new Error('useAudioDispatch must be used within an AudioDispatchProvider')
  }
  return context
}

type AudioDispatchProviderProps = {
  postId?: string
  title: string
  description?: string | null
  content?: string | null
  minutes: number
  audioUrl?: string | null
  children: React.ReactNode
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2]

export function AudioDispatchProvider(props: Readonly<AudioDispatchProviderProps>) {
  const { title, description, content, minutes, audioUrl, children } = props
  const isDeepDive = minutes >= 7

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioDuration, setAudioDuration] = useState(minutes * 60)

  // Waveform visualization bars
  const NUM_BARS = 36
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(() =>
    Array.from({ length: NUM_BARS }, (_, i) => {
      const seed = Math.sin((i + 1) * 0.7) * 0.5 + 0.5
      return 0.15 + seed * 0.7
    })
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const speechTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Extract clean narration script from post description + content
  const narrationText = useMemo(() => {
    const textSnippet = (content ?? '')
      .replaceAll(/<pre[\s\S]*?<\/pre>/gi, ' [code snippet omitted for audio briefing] ')
      .replaceAll(/<[^>]*>?/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim()
      .slice(0, 4500) // Narrate headline + key architectural points

    const descSnippet = description ? `${description}. ` : ''
    return `${title}. ${descSnippet}Beginning architectural overview. ${textSnippet}`
  }, [title, description, content])

  // Setup native Audio element if audioUrl exists
  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const onLoadedMetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setAudioDuration(audio.duration)
      }
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
  }, [audioUrl])

  // Real-time Waveform Animation Driver when playing
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    let frame = 0
    const updateWaveform = () => {
      frame += 0.15 * playbackRate
      setWaveAmplitudes((prev) =>
        prev.map((base, idx) => {
          const wobble = Math.sin(frame + idx * 0.45) * 0.35 + Math.cos(frame * 0.8 + idx * 0.2) * 0.25
          return Math.max(0.12, Math.min(1, base * 0.6 + wobble * 0.4 + 0.2))
        })
      )
      animFrameRef.current = requestAnimationFrame(updateWaveform)
    }

    animFrameRef.current = requestAnimationFrame(updateWaveform)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, playbackRate])

  // Web Speech API Synthesis Handler (Fallback when no pre-recorded audio file)
  const stopWebSpeech = useCallback(() => {
    if ('speechSynthesis' in globalThis) {
      globalThis.speechSynthesis.cancel()
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current)
      speechTimerRef.current = null
    }
  }, [])

  const startWebSpeech = useCallback(
    (startSec = 0) => {
      if (!('speechSynthesis' in globalThis)) {
        return
      }

      globalThis.speechSynthesis.cancel()

      // Calculate text offset based on scrubbed time
      const charRatio = Math.min(1, startSec / audioDuration)
      const startChar = Math.floor(narrationText.length * charRatio)
      const remainingText = narrationText.slice(startChar)

      const utterance = new SpeechSynthesisUtterance(remainingText)
      utterance.rate = playbackRate
      utterance.pitch = 0.95 // slightly deeper, neutral technical tone

      // Pick crisp English voice if available
      const voices = globalThis.speechSynthesis.getVoices()
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha'))
        ) ?? voices.find((v) => v.lang.startsWith('en'))
      if (preferredVoice) utterance.voice = preferredVoice

      utterance.addEventListener('end', () => {
        setIsPlaying(false)
        setCurrentTime(0)
        stopWebSpeech()
      })

      utterance.addEventListener('error', () => {
        setIsPlaying(false)
        stopWebSpeech()
      })

      utteranceRef.current = utterance
      globalThis.speechSynthesis.speak(utterance)

      // Time accumulator
      speechTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= audioDuration) {
            stopWebSpeech()
            setIsPlaying(false)
            return 0
          }
          return prev + 1 * playbackRate
        })
      }, 1000)
    },
    [audioDuration, narrationText, playbackRate, stopWebSpeech]
  )

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause()
      } else {
        stopWebSpeech()
      }
      setIsPlaying(false)
    } else {
      // Play
      if (audioRef.current) {
        void audioRef.current.play()
      } else {
        startWebSpeech(currentTime)
      }
      setIsPlaying(true)
    }
  }, [isPlaying, currentTime, startWebSpeech, stopWebSpeech])

  const seek = useCallback(
    (percentage: number) => {
      const targetTime = Math.max(0, Math.min(audioDuration, percentage * audioDuration))
      setCurrentTime(targetTime)

      if (audioRef.current) {
        audioRef.current.currentTime = targetTime
      } else if (isPlaying) {
        startWebSpeech(targetTime)
      }
    },
    [audioDuration, isPlaying, startWebSpeech]
  )

  const skip = useCallback(
    (seconds: number) => {
      const targetTime = Math.max(0, Math.min(audioDuration, currentTime + seconds))
      setCurrentTime(targetTime)

      if (audioRef.current) {
        audioRef.current.currentTime = targetTime
      } else if (isPlaying) {
        startWebSpeech(targetTime)
      }
    },
    [audioDuration, currentTime, isPlaying, startWebSpeech]
  )

  const setRate = useCallback(
    (rate: number) => {
      setPlaybackRate(rate)
      if (audioRef.current) {
        audioRef.current.playbackRate = rate
      } else if (isPlaying) {
        startWebSpeech(currentTime)
      }
    },
    [currentTime, isPlaying, startWebSpeech]
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (audioRef.current) {
        audioRef.current.muted = next
      }
      return next
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebSpeech()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [stopWebSpeech])

  const value = useMemo(
    () => ({
      isPlaying,
      currentTime,
      duration: audioDuration,
      playbackRate,
      isMuted,
      isDeepDive,
      togglePlay,
      seek,
      skip,
      setRate,
      toggleMute,
      waveformHeights: waveAmplitudes,
      title,
      minutes,
      audioAvailable: true
    }),
    [
      isPlaying,
      currentTime,
      audioDuration,
      playbackRate,
      isMuted,
      isDeepDive,
      togglePlay,
      seek,
      skip,
      setRate,
      toggleMute,
      waveAmplitudes,
      title,
      minutes
    ]
  )

  return (
    <AudioDispatchContext value={value}>
      {children}
    </AudioDispatchContext>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 1. Minimalist Monochrome Waveform Bar (Docked next to ReadingProgress at top of screen)
 */
export function AudioDispatchTopBar() {
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    togglePlay,
    seek,
    setRate,
    waveformHeights,
    isDeepDive
  } = useAudioDispatch()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const progressRatio = duration > 0 ? currentTime / duration : 0

  // Only render on deep dive articles
  if (!isDeepDive) return null

  return (
    <aside
      aria-label="Audio dispatch briefing player"
      className={cn(
        'fixed inset-x-0 top-[3px] z-40 border-b border-border bg-background/95 backdrop-blur-md transition-transform duration-200 select-none font-mono',
        isCollapsed ? '-translate-y-[calc(100%-8px)]' : 'translate-y-0'
      )}
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 text-xs">
        {/* Left: Play/Pause & Telemetry Tag */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex size-6 items-center justify-center border border-border bg-card text-foreground transition-colors hover:border-foreground active:translate-y-px cursor-pointer"
            aria-label={isPlaying ? 'Pause audio briefing' : 'Play audio briefing'}
          >
            {isPlaying ? (
              <PauseIcon className="size-3 fill-foreground" />
            ) : (
              <PlayIcon className="size-3 fill-foreground ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
            <HeadphonesIcon className="size-3 text-foreground" />
            <span className="hidden sm:inline font-semibold text-foreground">
              AUDIO DISPATCH
            </span>
            <span className="text-muted-foreground/60">{'//'}</span>
            <span className="text-muted-foreground">COMMUTER BRIEF</span>
          </div>
        </div>

        {/* Center: Monochrome Interactive Waveform Visualizer */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Audio waveform progress scrubber"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressRatio * 100)}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickPos = (e.clientX - rect.left) / rect.width
            seek(clickPos)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') seek(progressRatio + 0.05)
            if (e.key === 'ArrowLeft') seek(progressRatio - 0.05)
          }}
          className="flex h-5 flex-1 max-w-sm sm:max-w-md items-center justify-center gap-0.5 sm:gap-1 px-2 cursor-pointer outline-none"
        >
          {waveformHeights.map((amp, idx) => {
            const barProgress = idx / waveformHeights.length
            const isPassed = barProgress <= progressRatio
            const heightPx = Math.max(4, Math.round(amp * 18))

            return (
              <span
                key={idx}
                style={{ height: `${heightPx}px` }}
                className={cn(
                  'w-0.5 sm:w-1 transition-all duration-75',
                  isPassed
                    ? 'bg-foreground'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                )}
              />
            )
          })}
        </div>

        {/* Right: Timestamp, Speed Toggle & Collapse */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="tabular-nums text-muted-foreground hidden xs:inline">
            <span className="text-foreground font-semibold">
              {formatTime(currentTime)}
            </span>
            <span className="text-muted-foreground/50"> / </span>
            <span>{formatTime(duration)}</span>
          </span>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() => {
              const currentIdx = PLAYBACK_RATES.indexOf(playbackRate)
              const nextRate = PLAYBACK_RATES[(currentIdx + 1) % PLAYBACK_RATES.length]
              if (nextRate) setRate(nextRate)
            }}
            className="border border-border/80 bg-muted/40 px-1.5 py-0.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer"
            title="Adjust audio playback rate"
          >
            {playbackRate}x
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand audio player' : 'Collapse audio player'}
          >
            {isCollapsed ? (
              <ChevronDownIcon className="size-3" />
            ) : (
              <ChevronUpIcon className="size-3" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

/**
 * 2. In-Article Hero Dispatch Card (Rendered in post header for >7 min deep dives)
 */
export function AudioDispatchHero() {
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isMuted,
    togglePlay,
    seek,
    skip,
    setRate,
    toggleMute,
    waveformHeights,
    minutes,
    isDeepDive
  } = useAudioDispatch()

  if (!isDeepDive) return null

  const progressRatio = duration > 0 ? currentTime / duration : 0

  return (
    <div className="relative border border-border bg-card p-4 sm:p-5 font-mono text-xs select-none">
      <CornerBrackets />

      {/* Top Protocol Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <HeadphonesIcon className="size-4 text-foreground" />
          <span className="text-xs font-bold tracking-wider uppercase text-foreground">
            Audio Dispatch // Commuter Briefing
          </span>
          <span className="border border-border/80 bg-muted/40 px-1.5 py-0.2 text-[9px] text-muted-foreground uppercase">
            DEEP DIVE ({minutes} MIN READ)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="size-1.5 bg-foreground" />
          <span>FORMAT: 0PX WAVEFORM TTS</span>
        </div>
      </div>

      {/* Large Scrubbable Waveform Visualizer */}
      <div className="py-4">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Scrub audio briefing position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressRatio * 100)}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickPos = (e.clientX - rect.left) / rect.width
            seek(clickPos)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') seek(progressRatio + 0.05)
            if (e.key === 'ArrowLeft') seek(progressRatio - 0.05)
          }}
          className="flex h-12 w-full items-center justify-between gap-1 border border-border/60 bg-muted/20 px-3 cursor-pointer outline-none transition-colors hover:border-foreground/40"
        >
          {waveformHeights.map((amp, idx) => {
            const barProgress = idx / waveformHeights.length
            const isPassed = barProgress <= progressRatio
            const heightPx = Math.max(6, Math.round(amp * 38))

            return (
              <span
                key={idx}
                style={{ height: `${heightPx}px` }}
                className={cn(
                  'flex-1 transition-all duration-75',
                  isPassed
                    ? 'bg-foreground'
                    : 'bg-muted-foreground/25 hover:bg-muted-foreground/60'
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Control Actions & Time Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="default"
            size="sm"
            corners
            onClick={togglePlay}
            className="gap-1.5"
            aria-label={isPlaying ? 'Pause briefing' : 'Play briefing'}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="size-3.5 fill-background" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="size-3.5 fill-background ml-0.5" />
                <span>Listen Briefing</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => skip(-15)}
            title="Rewind 15 seconds"
            className="px-2"
          >
            <RewindIcon className="size-3" />
            <span className="text-[10px]">15s</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => skip(15)}
            title="Skip forward 15 seconds"
            className="px-2"
          >
            <FastForwardIcon className="size-3" />
            <span className="text-[10px]">15s</span>
          </Button>
        </div>

        {/* Time Elapsed & Duration Display */}
        <div className="flex items-center gap-2">
          <div className="border border-border/80 bg-background px-2 py-1 font-mono text-[11px] tabular-nums">
            <span className="font-semibold text-foreground">
              {formatTime(currentTime)}
            </span>
            <span className="text-muted-foreground/60"> / </span>
            <span className="text-muted-foreground">{formatTime(duration)}</span>
          </div>

          {/* Speed Pills */}
          <div className="flex items-center border border-border/80 bg-background">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setRate(rate)}
                className={cn(
                  'px-2 py-1 text-[10px] transition-colors cursor-pointer',
                  playbackRate === rate
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="border border-border/80 bg-background p-1 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? (
              <VolumeXIcon className="size-3.5" />
            ) : (
              <Volume2Icon className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
