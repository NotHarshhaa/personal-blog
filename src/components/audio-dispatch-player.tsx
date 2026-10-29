'use client'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  FastForwardIcon,
  HeadphonesIcon,
  LanguagesIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  Volume2Icon,
  VolumeXIcon
} from 'lucide-react'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CornerBrackets } from '@/components/frame'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

type VoiceCatalogEntry = {
  name: string
  gender: VoiceGender
}

type VoiceGroup = {
  lang: string
  label: string
  voices: VoiceCatalogEntry[]
}

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
  voiceGroups: VoiceGroup[]
  voiceLang: string
  voiceGender: 'auto' | VoiceGender
  activeVoiceName: string | null
  setVoicePreference: (lang: string, gender: 'auto' | VoiceGender) => void
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

/**
 * Chrome's synthesis engine silently stalls on long utterances (no event, no
 * audio) — narration is queued as short chunks instead of one giant utterance.
 */
const CHUNK_CHAR_LIMIT = 220

const chunkNarration = (text: string): string[] => {
  const words = text.replaceAll(/\s+/g, ' ').trim().split(' ')
  const chunks: string[] = []
  let current = ''

  for (const word of words) {
    if (current && `${current} ${word}`.length > CHUNK_CHAR_LIMIT) {
      chunks.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) chunks.push(current)

  return chunks
}

const pickPreferredVoice = (voices: SpeechSynthesisVoice[]) =>
  voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
  ) ?? voices.find((v) => v.lang.startsWith('en'))

type VoiceGender = 'male' | 'female' | 'neutral'

type VoicePreference = {
  lang: string
  gender: 'auto' | VoiceGender
}

const VOICE_STORAGE_KEY = 'audio-dispatch-voice'

/**
 * The Web Speech API exposes no voice gender — infer it from the well-known
 * narrator names shipped by the platforms. Female names are tested first
 * ("female" itself contains "male").
 */
const FEMALE_VOICE_HINTS = [
  'female',
  'zira',
  'heera',
  'samantha',
  'aria',
  'jenny',
  'michelle',
  'ana',
  'neerja',
  'sonia',
  'libby',
  'maisie',
  'hazel',
  'elsa',
  'kalpana',
  'swara',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'susan',
  'victoria',
  'amber',
  'emma',
  'ava',
  'isabella',
  'lara',
  'molly',
  'nancy',
  'nova',
  'sara',
  'serena',
  'allison',
  'ava',
  'joanna',
  'kendra',
  'kimberly',
  'salli',
  'natasha',
  'clara',
  'yan',
  'xiaoxiao'
]

const MALE_VOICE_HINTS = [
  'david',
  'mark',
  'ravi',
  'alex',
  'daniel',
  'fred',
  'tom',
  'aaron',
  'george',
  'oliver',
  'ryan',
  'guy',
  'prabhat',
  'madhur',
  'william',
  'richard',
  'brian',
  'christopher',
  'eric',
  'steffan',
  'james',
  'john',
  'andrew',
  'brandon',
  'jacob',
  'matthew',
  'reed',
  'roger',
  'thomas',
  'walter',
  'diego',
  'jorge',
  'luca',
  'liam',
  'matthew',
  'brian',
  'arthur',
  'kunal',
  'madhav'
]

const GENDER_LABELS: Record<'auto' | VoiceGender, string> = {
  auto: 'Auto',
  female: '♀ F',
  male: '♂ M',
  neutral: 'Neutral'
}

const guessVoiceGender = (voice: SpeechSynthesisVoice): VoiceGender => {
  const name = voice.name.toLowerCase()
  if (FEMALE_VOICE_HINTS.some((hint) => name.includes(hint))) return 'female'
  if (MALE_VOICE_HINTS.some((hint) => name.includes(hint))) return 'male'
  return 'neutral'
}

const languageLabel = (lang: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(lang) ?? lang
  } catch {
    return lang
  }
}

const shortVoiceLabel = (name: string) => {
  const withoutVendor = name.replace(/^(Microsoft|Google)\s+/i, '')
  const primary = withoutVendor.split(' - ')[0] ?? withoutVendor
  const label = primary.split('(')[0] ?? primary
  return label.trim() || name
}

/**
 * Resolve the utterance voice for the reader's language + gender preference,
 * falling back to any voice in the language and finally to the auto heuristic.
 */
const resolveNarrationVoice = (
  voices: SpeechSynthesisVoice[],
  preference: VoicePreference
): SpeechSynthesisVoice | undefined => {
  if (preference.lang !== 'auto') {
    const normalized = preference.lang.toLowerCase()
    const inLanguage = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === normalized)

    if (inLanguage.length > 0) {
      const gendered =
        preference.gender === 'auto'
          ? inLanguage
          : inLanguage.filter((v) => guessVoiceGender(v) === preference.gender)
      // Cloud/neural voices generally sound crisper than local SAPI voices
      const candidates = gendered.length > 0 ? gendered : inLanguage
      return candidates.find((v) => !v.localService) ?? candidates[0]
    }
  }

  // Auto language: stay among English voices when possible, honoring gender
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const pool = english.length > 0 ? english : voices
  if (preference.gender !== 'auto') {
    const gendered = pool.filter((v) => guessVoiceGender(v) === preference.gender)
    if (gendered.length > 0) {
      return gendered.find((v) => !v.localService) ?? gendered[0]
    }
  }

  return pickPreferredVoice(pool)
}

/** Voices load asynchronously in Chromium — wait briefly for voiceschanged. */
const waitForVoices = (synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    const existing = synth.getVoices()
    if (existing.length > 0) {
      resolve(existing)
      return
    }

    const timer = setTimeout(() => {
      synth.removeEventListener('voiceschanged', onChange)
      resolve(synth.getVoices())
    }, 2000)
    const onChange = () => {
      const voices = synth.getVoices()
      if (voices.length > 0) {
        clearTimeout(timer)
        synth.removeEventListener('voiceschanged', onChange)
        resolve(voices)
      }
    }
    synth.addEventListener('voiceschanged', onChange)
  })

export function AudioDispatchProvider(props: Readonly<AudioDispatchProviderProps>) {
  const { title, description, content, minutes, audioUrl, children } = props
  const isDeepDive = minutes >= 7

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioDuration, setAudioDuration] = useState(minutes * 60)
  const [ttsUnavailable, setTtsUnavailable] = useState(false)

  // Narration voice catalog + reader preference (language & gender)
  const [synthVoices, setSynthVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceLang, setVoiceLang] = useState('auto')
  const [voiceGender, setVoiceGender] = useState<'auto' | VoiceGender>('auto')

  // Waveform visualization bars
  const NUM_BARS = 36
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(() =>
    Array.from({ length: NUM_BARS }, (_, i) => {
      const seed = Math.sin((i + 1) * 0.7) * 0.5 + 0.5
      return 0.15 + seed * 0.7
    })
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const speechTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Narration queue machinery (chunked Web Speech synthesis)
  const narrationChunksRef = useRef<string[]>([])
  const chunkDurationsRef = useRef<number[]>([])
  const chunkStartsRef = useRef<number[]>([])
  const queueIndexRef = useRef(0)
  const pendingBaseRef = useRef(0)
  const queueBaseTimeRef = useRef(0)
  const chunkStartedAtRef = useRef(0)
  const stallTicksRef = useRef(0)
  const restartTokenRef = useRef(0)
  const mutedRef = useRef(false)
  const playbackRateRef = useRef(playbackRate)
  const audioDurationRef = useRef(audioDuration)
  const voicePrefRef = useRef<VoicePreference>({ lang: 'auto', gender: 'auto' })

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

  useEffect(() => {
    playbackRateRef.current = playbackRate
  }, [playbackRate])

  useEffect(() => {
    audioDurationRef.current = audioDuration
  }, [audioDuration])

  useEffect(() => {
    mutedRef.current = isMuted
  }, [isMuted])

  useEffect(() => {
    voicePrefRef.current = { lang: voiceLang, gender: voiceGender }
  }, [voiceLang, voiceGender])

  // Build the voice catalog as the platform loads its synthesizers
  useEffect(() => {
    if (!('speechSynthesis' in globalThis)) return

    const synth = globalThis.speechSynthesis
    const update = () => {
      const voices = synth.getVoices()
      if (voices.length > 0) {
        setSynthVoices(voices)
      }
    }

    update()
    synth.addEventListener('voiceschanged', update)
    return () => synth.removeEventListener('voiceschanged', update)
  }, [])

  // Restore the reader's saved voice preference (client-only to keep SSR output stable)
  useEffect(() => {
    try {
      const raw = globalThis.localStorage.getItem(VOICE_STORAGE_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw) as Partial<VoicePreference>
      if (typeof parsed.lang === 'string' && parsed.lang) {
        setVoiceLang(parsed.lang)
      }
      if (
        parsed.gender === 'auto' ||
        parsed.gender === 'male' ||
        parsed.gender === 'female' ||
        parsed.gender === 'neutral'
      ) {
        setVoiceGender(parsed.gender)
      }
    } catch {
      // Corrupted preference — fall back to auto
    }
  }, [])

  // Drop a saved language that this machine has no synthesizer for
  useEffect(() => {
    if (voiceLang === 'auto' || synthVoices.length === 0) return
    if (
      !synthVoices.some(
        (voice) => voice.lang.toLowerCase().replace('_', '-') === voiceLang.toLowerCase()
      )
    ) {
      setVoiceLang('auto')
    }
  }, [synthVoices, voiceLang])

  // Detect a missing synthesis engine after mount — reading `speechSynthesis`
  // during the initial render would mismatch the server output
  useEffect(() => {
    if (!('speechSynthesis' in globalThis)) {
      setTtsUnavailable(true)
    }
  }, [])

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
          const wobble =
            Math.sin(frame + idx * 0.45) * 0.35 + Math.cos(frame * 0.8 + idx * 0.2) * 0.25
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

  // ---- Web Speech API engine (fallback when no pre-recorded audio file) ----

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  const stopSpeechClock = useCallback(() => {
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current)
      speechTimerRef.current = null
    }
  }, [])

  /** Engine failed to produce audio — surface an honest offline state. */
  const failSpeech = useCallback(() => {
    clearWatchdog()
    stopSpeechClock()
    if ('speechSynthesis' in globalThis) {
      globalThis.speechSynthesis.cancel()
    }
    setTtsUnavailable(true)
    setIsPlaying(false)
  }, [clearWatchdog, stopSpeechClock])

  const finishSpeech = useCallback(() => {
    clearWatchdog()
    stopSpeechClock()
    setIsPlaying(false)
    setCurrentTime(0)
  }, [clearWatchdog, stopSpeechClock])

  const speakChunkRef = useRef<((index: number, partialText?: string) => void) | null>(null)

  const speakChunk = useCallback(
    (index: number, partialText?: string) => {
      const synth = globalThis.speechSynthesis
      const chunks = narrationChunksRef.current

      if (index >= chunks.length) {
        finishSpeech()
        return
      }

      queueIndexRef.current = index
      const utterance = new SpeechSynthesisUtterance(partialText ?? chunks[index])
      utterance.rate = playbackRateRef.current
      utterance.pitch = 0.95 // slightly deeper, neutral technical tone
      utterance.volume = mutedRef.current ? 0 : 1

      const voice = resolveNarrationVoice(synth.getVoices(), voicePrefRef.current)
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      }

      // Cancel fired this utterance? Chrome emits `end` asynchronously after
      // cancel()/stop() — without this guard the queue would ghost-continue
      // after a pause and re-enter the cancel race.
      const tokenAtSpeak = restartTokenRef.current

      utterance.addEventListener('start', () => {
        clearWatchdog()
        chunkStartedAtRef.current = Date.now()
        queueBaseTimeRef.current = pendingBaseRef.current
      })
      utterance.addEventListener('boundary', clearWatchdog)
      utterance.addEventListener('end', () => {
        clearWatchdog()
        if (restartTokenRef.current !== tokenAtSpeak) return
        speakChunkRef.current?.(index + 1)
      })
      utterance.addEventListener('error', (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') return
        failSpeech()
      })

      if (partialText === undefined) {
        pendingBaseRef.current = chunkStartsRef.current[index] ?? queueBaseTimeRef.current
      }

      synth.speak(utterance)

      // Watchdog: engine idle with no start/boundary event → synthesis is offline
      clearWatchdog()
      watchdogRef.current = setTimeout(() => {
        if (!synth.speaking && !synth.pending) {
          failSpeech()
        }
      }, 4000)
    },
    [clearWatchdog, failSpeech, finishSpeech]
  )

  useEffect(() => {
    speakChunkRef.current = speakChunk
  }, [speakChunk])

  const stopWebSpeech = useCallback(() => {
    restartTokenRef.current += 1
    clearWatchdog()
    stopSpeechClock()
    if ('speechSynthesis' in globalThis) {
      globalThis.speechSynthesis.cancel()
    }
  }, [clearWatchdog, stopSpeechClock])

  const startSpeechFrom = useCallback(
    (startSec: number) => {
      const synth = 'speechSynthesis' in globalThis ? globalThis.speechSynthesis : null
      if (!synth) {
        setTtsUnavailable(true)
        return
      }

      // Chunk the narration and precompute each chunk's start time
      const chunks = chunkNarration(narrationText)
      narrationChunksRef.current = chunks
      const totalChars = chunks.reduce((sum, chunk) => sum + chunk.length, 0) || 1
      const durations = chunks.map(
        (chunk) => (chunk.length / totalChars) * audioDurationRef.current
      )
      chunkDurationsRef.current = durations
      const starts: number[] = []
      let accumulated = 0
      for (const duration of durations) {
        starts.push(accumulated)
        accumulated += duration
      }
      chunkStartsRef.current = starts

      void waitForVoices(synth).then((voices) => {
        if (voices.length === 0) {
          failSpeech()
          return
        }

        // Invalidate any pending restart and stop the current queue
        const token = ++restartTokenRef.current
        stopSpeechClock()
        synth.cancel()

        // Locate the chunk containing startSec and slice into it proportionally
        const clamped = Math.max(0, Math.min(audioDurationRef.current, startSec))
        let index = 0
        let offsetRatio = 0
        for (let i = 0; i < chunks.length; i++) {
          const duration = durations[i] ?? 0
          const chunkStart = starts[i] ?? 0
          if (clamped < chunkStart + duration || i === chunks.length - 1) {
            index = i
            offsetRatio =
              duration > 0 ? Math.max(0, Math.min(1, (clamped - chunkStart) / duration)) : 0
            break
          }
        }

        pendingBaseRef.current = clamped
        stallTicksRef.current = 0
        const activeChunk = chunks[index]
        const partialText =
          activeChunk && offsetRatio > 0.01
            ? activeChunk.slice(Math.floor(activeChunk.length * offsetRatio))
            : undefined

        // Chromium settles cancel() asynchronously — speaking in the same tick
        // gets the new utterance killed with 'interrupted'. Give it a beat.
        globalThis.setTimeout(() => {
          if (restartTokenRef.current !== token) return

          speakChunkRef.current?.(index, partialText)

          // Narration clock — advances only while the engine is actually speaking
          speechTimerRef.current = setInterval(() => {
            if (!synth.speaking && !synth.pending) {
              stallTicksRef.current += 1
              if (stallTicksRef.current > 6) {
                failSpeech()
              }
              return
            }

            stallTicksRef.current = 0
            const elapsedReal = (Date.now() - chunkStartedAtRef.current) / 1000
            setCurrentTime(
              Math.min(
                audioDurationRef.current,
                queueBaseTimeRef.current + elapsedReal * playbackRateRef.current
              )
            )
          }, 500)
        }, 80)
      })
    },
    [narrationText, failSpeech, stopSpeechClock]
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
      return
    }

    // Play
    if (audioRef.current) {
      void audioRef.current.play()
      setIsPlaying(true)
    } else if (!ttsUnavailable) {
      startSpeechFrom(currentTime)
      setIsPlaying(true)
    }
  }, [isPlaying, currentTime, ttsUnavailable, startSpeechFrom, stopWebSpeech])

  const seek = useCallback(
    (percentage: number) => {
      const targetTime = Math.max(0, Math.min(audioDuration, percentage * audioDuration))
      setCurrentTime(targetTime)

      if (audioRef.current) {
        audioRef.current.currentTime = targetTime
      } else if (isPlaying && !ttsUnavailable) {
        startSpeechFrom(targetTime)
      }
    },
    [audioDuration, isPlaying, ttsUnavailable, startSpeechFrom]
  )

  const skip = useCallback(
    (seconds: number) => {
      const targetTime = Math.max(0, Math.min(audioDuration, currentTime + seconds))
      setCurrentTime(targetTime)

      if (audioRef.current) {
        audioRef.current.currentTime = targetTime
      } else if (isPlaying && !ttsUnavailable) {
        startSpeechFrom(targetTime)
      }
    },
    [audioDuration, currentTime, isPlaying, ttsUnavailable, startSpeechFrom]
  )

  const setRate = useCallback(
    (rate: number) => {
      setPlaybackRate(rate)
      if (audioRef.current) {
        audioRef.current.playbackRate = rate
      } else if (isPlaying && !ttsUnavailable) {
        startSpeechFrom(currentTime)
      }
    },
    [currentTime, isPlaying, ttsUnavailable, startSpeechFrom]
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      mutedRef.current = next
      if (audioRef.current) {
        audioRef.current.muted = next
      }
      return next
    })
    // TTS utterances carry their own volume — restart the active chunk so the
    // toggle is heard immediately instead of at the next chunk boundary.
    if (isPlaying && !audioRef.current && !ttsUnavailable) {
      startSpeechFrom(currentTime)
    }
  }, [isPlaying, currentTime, ttsUnavailable, startSpeechFrom])

  // Switch the narration voice, persist the choice, and re-voice mid-playback
  const setVoicePreference = useCallback(
    (lang: string, gender: 'auto' | VoiceGender) => {
      setVoiceLang(lang)
      setVoiceGender(gender)
      voicePrefRef.current = { lang, gender }

      try {
        globalThis.localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify({ lang, gender }))
      } catch {
        // Storage unavailable — the preference is session-only
      }

      if (isPlaying && !audioRef.current && !ttsUnavailable) {
        startSpeechFrom(currentTime)
      }
    },
    [isPlaying, currentTime, ttsUnavailable, startSpeechFrom]
  )

  const voiceGroups = useMemo<VoiceGroup[]>(() => {
    const byLanguage = new Map<string, SpeechSynthesisVoice[]>()
    for (const voice of synthVoices) {
      const lang = voice.lang.toLowerCase().replace('_', '-')
      const bucket = byLanguage.get(lang) ?? []
      bucket.push(voice)
      byLanguage.set(lang, bucket)
    }

    return [...byLanguage.entries()]
      .map(([lang, voices]) => ({
        lang,
        label: languageLabel(lang),
        voices: voices.map((voice) => ({
          name: shortVoiceLabel(voice.name),
          gender: guessVoiceGender(voice)
        }))
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [synthVoices])

  const activeVoiceName = useMemo(() => {
    const voice = resolveNarrationVoice(synthVoices, { lang: voiceLang, gender: voiceGender })
    return voice ? shortVoiceLabel(voice.name) : null
  }, [synthVoices, voiceLang, voiceGender])

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
      audioAvailable: !ttsUnavailable,
      voiceGroups,
      voiceLang,
      voiceGender,
      activeVoiceName,
      setVoicePreference
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
      minutes,
      ttsUnavailable,
      voiceGroups,
      voiceLang,
      voiceGender,
      activeVoiceName,
      setVoicePreference
    ]
  )

  return <AudioDispatchContext value={value}>{children}</AudioDispatchContext>
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
    isDeepDive,
    audioAvailable
  } = useAudioDispatch()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const progressRatio = duration > 0 ? currentTime / duration : 0

  // Only render on deep dive articles with a working synthesis engine
  if (!isDeepDive || !audioAvailable) return null

  return (
    <aside
      aria-label='Audio dispatch briefing player'
      className={cn(
        'border-border bg-background/95 fixed inset-x-0 top-[3px] z-40 border-b font-mono backdrop-blur-md transition-transform duration-200 select-none',
        isCollapsed ? '-translate-y-[calc(100%-8px)]' : 'translate-y-0'
      )}
    >
      <div className='mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-3 text-xs sm:px-6'>
        {/* Left: Play/Pause & Telemetry Tag */}
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={togglePlay}
            className='border-border bg-card text-foreground hover:border-foreground flex size-6 cursor-pointer items-center justify-center border transition-colors active:translate-y-px'
            aria-label={isPlaying ? 'Pause audio briefing' : 'Play audio briefing'}
          >
            {isPlaying ? (
              <PauseIcon className='fill-foreground size-3' />
            ) : (
              <PlayIcon className='fill-foreground ml-0.5 size-3' />
            )}
          </button>

          <div className='text-muted-foreground flex items-center gap-1.5 text-[10px] uppercase'>
            <HeadphonesIcon className='text-foreground size-3' />
            <span className='text-foreground hidden font-semibold sm:inline'>AUDIO DISPATCH</span>
            <span className='text-muted-foreground/60'>{'//'}</span>
            <span className='text-muted-foreground'>COMMUTER BRIEF</span>
          </div>
        </div>

        {/* Center: Monochrome Interactive Waveform Visualizer */}
        <div
          role='slider'
          tabIndex={0}
          aria-label='Audio waveform progress scrubber'
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
          className='flex h-5 max-w-sm flex-1 cursor-pointer items-center justify-center gap-0.5 px-2 outline-none sm:max-w-md sm:gap-1'
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
                  'w-0.5 transition-all duration-75 sm:w-1',
                  isPassed ? 'bg-foreground' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                )}
              />
            )
          })}
        </div>

        {/* Right: Timestamp, Speed Toggle & Collapse */}
        <div className='flex items-center gap-2 text-[10px]'>
          <span className='text-muted-foreground xs:inline hidden tabular-nums'>
            <span className='text-foreground font-semibold'>{formatTime(currentTime)}</span>
            <span className='text-muted-foreground/50'> / </span>
            <span>{formatTime(duration)}</span>
          </span>

          {/* Speed Toggle */}
          <button
            type='button'
            onClick={() => {
              const currentIdx = PLAYBACK_RATES.indexOf(playbackRate)
              const nextRate = PLAYBACK_RATES[(currentIdx + 1) % PLAYBACK_RATES.length]
              if (nextRate) setRate(nextRate)
            }}
            className='border-border/80 bg-muted/40 text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer border px-1.5 py-0.5 transition-colors'
            title='Adjust audio playback rate'
          >
            {playbackRate}x
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type='button'
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='text-muted-foreground hover:text-foreground cursor-pointer p-1 transition-colors'
            title={isCollapsed ? 'Expand audio player' : 'Collapse audio player'}
          >
            {isCollapsed ? (
              <ChevronDownIcon className='size-3' />
            ) : (
              <ChevronUpIcon className='size-3' />
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
    isDeepDive,
    audioAvailable,
    voiceGroups,
    voiceLang,
    voiceGender,
    activeVoiceName,
    setVoicePreference
  } = useAudioDispatch()

  if (!isDeepDive) return null

  const progressRatio = duration > 0 ? currentTime / duration : 0

  // No synthesis engine (or it failed to start) — say so instead of faking playback
  if (!audioAvailable) {
    return (
      <div className='border-border bg-card relative border p-4 font-mono text-xs select-none sm:p-5'>
        <CornerBrackets />
        <div className='border-border/80 flex flex-wrap items-center justify-between gap-2 border-b pb-3'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <VolumeXIcon className='size-4' aria-hidden />
            <span className='text-xs font-bold tracking-wider uppercase'>
              Audio dispatch // engine offline
            </span>
          </div>
          <span className='border-border/80 bg-muted/40 text-muted-foreground border px-1.5 py-0.5 text-[9px] uppercase'>
            DEEP DIVE ({minutes} MIN READ)
          </span>
        </div>
        <p className='text-muted-foreground/70 mt-3'>
          No speech synthesis engine is available in this browser — the text dispatch below carries
          the full briefing.
        </p>
      </div>
    )
  }

  return (
    <div className='border-border bg-card relative border p-4 font-mono text-xs select-none sm:p-5'>
      <CornerBrackets />

      {/* Top Protocol Header */}
      <div className='border-border/80 flex flex-wrap items-center justify-between gap-2 border-b pb-3'>
        <div className='flex items-center gap-2'>
          <HeadphonesIcon className='text-foreground size-4' />
          <span className='text-foreground text-xs font-bold tracking-wider uppercase'>
            Audio Dispatch // Commuter Briefing
          </span>
          <span className='border-border/80 bg-muted/40 py-0.2 text-muted-foreground border px-1.5 text-[9px] uppercase'>
            DEEP DIVE ({minutes} MIN READ)
          </span>
        </div>

        <div className='text-muted-foreground flex items-center gap-2 text-[10px]'>
          <span className='bg-foreground size-1.5' />
          <span>FORMAT: 0PX WAVEFORM TTS</span>
        </div>
      </div>

      {/* Large Scrubbable Waveform Visualizer */}
      <div className='py-4'>
        <div
          role='slider'
          tabIndex={0}
          aria-label='Scrub audio briefing position'
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
          className='border-border/60 bg-muted/20 hover:border-foreground/40 flex h-12 w-full cursor-pointer items-center justify-between gap-1 border px-3 transition-colors outline-none'
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
                  isPassed ? 'bg-foreground' : 'bg-muted-foreground/25 hover:bg-muted-foreground/60'
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Narration Voice: language group + narrator gender */}
      <div className='border-border/80 bg-background flex flex-wrap items-center gap-2 border px-2.5 py-1.5'>
        <span className='text-muted-foreground/70 flex items-center gap-1 font-mono text-[9px] tracking-widest uppercase'>
          <LanguagesIcon className='size-3' aria-hidden />
          Voice
        </span>

        <select
          value={voiceLang}
          onChange={(e) => setVoicePreference(e.target.value, voiceGender)}
          aria-label='Narration language'
          className='border-border bg-background text-foreground focus:border-foreground h-6 cursor-pointer border px-1.5 font-mono text-[10px] uppercase outline-none'
        >
          <option value='auto'>Auto</option>
          {voiceGroups.map((group) => (
            <option key={group.lang} value={group.lang}>
              {group.label} ({group.voices.length})
            </option>
          ))}
        </select>

        <div className='border-border flex items-center border'>
          {(['auto', 'female', 'male'] as const).map((gender) => (
            <button
              key={gender}
              type='button'
              onClick={() => setVoicePreference(voiceLang, gender)}
              aria-pressed={voiceGender === gender}
              title={`Narrator gender: ${gender}`}
              className={cn(
                'cursor-pointer px-2 py-0.5 font-mono text-[10px] uppercase transition-colors',
                voiceGender === gender
                  ? 'bg-foreground text-background font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {GENDER_LABELS[gender]}
            </button>
          ))}
        </div>

        {activeVoiceName && (
          <span className='text-muted-foreground/60 ml-auto truncate font-mono text-[9px] uppercase'>
            {activeVoiceName}
          </span>
        )}
      </div>

      {/* Control Actions & Time Row */}
      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        {/* Playback Transport Buttons */}
        <div className='flex items-center gap-1.5'>
          <Button
            variant='default'
            size='sm'
            corners
            onClick={togglePlay}
            className='gap-1.5'
            aria-label={isPlaying ? 'Pause briefing' : 'Play briefing'}
          >
            {isPlaying ? (
              <>
                <PauseIcon className='fill-background size-3.5' />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className='fill-background ml-0.5 size-3.5' />
                <span>Listen Briefing</span>
              </>
            )}
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => skip(-15)}
            title='Rewind 15 seconds'
            className='px-2'
          >
            <RewindIcon className='size-3' />
            <span className='text-[10px]'>15s</span>
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => skip(15)}
            title='Skip forward 15 seconds'
            className='px-2'
          >
            <FastForwardIcon className='size-3' />
            <span className='text-[10px]'>15s</span>
          </Button>
        </div>

        {/* Time Elapsed & Duration Display */}
        <div className='flex items-center gap-2'>
          <div className='border-border/80 bg-background border px-2 py-1 font-mono text-[11px] tabular-nums'>
            <span className='text-foreground font-semibold'>{formatTime(currentTime)}</span>
            <span className='text-muted-foreground/60'> / </span>
            <span className='text-muted-foreground'>{formatTime(duration)}</span>
          </div>

          {/* Speed Pills */}
          <div className='border-border/80 bg-background flex items-center border'>
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type='button'
                onClick={() => setRate(rate)}
                className={cn(
                  'cursor-pointer px-2 py-1 text-[10px] transition-colors',
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
            type='button'
            onClick={toggleMute}
            className='border-border/80 bg-background text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer border p-1 transition-colors'
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeXIcon className='size-3.5' /> : <Volume2Icon className='size-3.5' />}
          </button>
        </div>
      </div>
    </div>
  )
}
