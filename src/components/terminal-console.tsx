'use client'

import { SquareTerminalIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Frame, StripHeader } from '@/components/frame'
import { SITE_TOPICS } from '@/lib/constants'
import { cn } from '@/utils'
import { formatPostDate } from '@/utils/format-post-date'

type TerminalPost = {
  id: string
  title: string
  tags: string[]
  createdAt: Date
}

type Line = {
  id: number
  kind: 'system' | 'input' | 'output' | 'error'
  text: string
}

const PROMPT = 'guest@blog:~$'

const COMMANDS = [
  'help',
  'whoami',
  'ls',
  'cd',
  'open',
  'random',
  'topics',
  'topic',
  'goto',
  'theme',
  'subscribe',
  'rss',
  'date',
  'echo',
  'sysinfo',
  'history',
  'sudo',
  'clear',
  'exit'
] as const

const SECTIONS: Record<string, string> = {
  '~': '/',
  posts: '/',
  snippets: '/snippets',
  roadmaps: '/roadmaps',
  bookmarks: '/bookmarks',
  newsletter: '/newsletter'
}

const HELP_TEXT = [
  'available commands:',
  '  help              list commands',
  '  whoami            session identity',
  '  ls [posts]        list sections or recent dispatches',
  '  cd <section>      jump — posts | snippets | roadmaps | bookmarks | newsletter',
  '  open <n>          read dispatch n from ls posts',
  '  random            open a random dispatch',
  '  topics            list topics',
  '  topic <name>      filter dispatches by topic',
  '  goto <path>       navigate to any route',
  '  theme <mode>      light | dark | system',
  '  subscribe         join the bi-weekly email dispatch',
  '  rss               copy the RSS feed url',
  '  sysinfo           session + viewport telemetry',
  '  history           replay past commands',
  '  clear             wipe the terminal (also ctrl+l)',
  '  exit              end the session'
].join('\n')

type TerminalConsoleProps = {
  posts: TerminalPost[]
  className?: string
}

const TerminalConsole = ({ posts, className }: Readonly<TerminalConsoleProps>) => {
  const router = useRouter()
  const { setTheme, theme } = useTheme()

  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, kind: 'system', text: 'HARSHHAA//OS v2.4 — guest terminal (tty1)' },
    {
      id: 1,
      kind: 'system',
      text: `${posts.length} dispatches indexed. Type 'help' for available commands.`
    }
  ])
  const [value, setValue] = useState('')
  const idRef = useRef(2)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number | null>(null)

  const push = useCallback((kind: Line['kind'], text: string) => {
    setLines((prev) => [...prev, { id: idRef.current++, kind, text }])
  }, [])

  // Keep the viewport pinned to the newest output
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const executeCommand = useCallback(
    (command: string, arg: string) => {
      const handlers: Record<string, () => void> = {
        help: () => {
          push('output', HELP_TEXT)
        },
        whoami: () => {
          push(
            'output',
            "guest — reader @ Harshhaa's DevOps, Cloud & AI Space (clearance: read-only)"
          )
        },
        ls: () => {
          if (!arg || arg === '~') {
            push('output', 'posts/  snippets/  roadmaps/  bookmarks/  newsletter/')
            return
          }
          if (arg !== 'posts') {
            push('error', `ls: ${arg}: no such directory — try 'ls' or 'ls posts'`)
            return
          }
          if (posts.length === 0) {
            push('error', 'ls: no dispatches indexed yet')
            return
          }
          push(
            'output',
            posts
              .map(
                (post, i) =>
                  `[${String(i + 1).padStart(3, '0')}] ${post.title} — ${formatPostDate(post.createdAt, { relative: true })}`
              )
              .join('\n')
          )
        },
        cd: () => {
          const target = SECTIONS[arg]
          if (!target) {
            push('error', `cd: ${arg}: no such section — try 'ls'`)
            return
          }
          push('output', `→ ${target}`)
          router.push(target)
        },
        open: () => {
          const n = Number(arg)
          const post = Number.isInteger(n) ? posts[n - 1] : undefined
          if (!post) {
            push('error', `open: invalid index '${arg}' — run 'ls posts' first`)
            return
          }
          push('output', `→ opening [${String(n).padStart(3, '0')}] ${post.title}`)
          router.push(`/posts/${post.id}`)
        },
        random: () => {
          const post = posts[Math.floor(Math.random() * posts.length)]
          if (!post) {
            push('error', 'random: the archive is empty')
            return
          }
          push('output', `→ random dispatch: ${post.title}`)
          router.push(`/posts/${post.id}`)
        },
        topics: () => {
          push('output', SITE_TOPICS.map((topic) => `#${topic}`).join('  '))
        },
        topic: () => {
          const match = SITE_TOPICS.find((topic) => topic.toLowerCase() === arg.toLowerCase())
          if (!match) {
            push('error', `topic: '${arg}' not found — run 'topics'`)
            return
          }
          push('output', `→ filtering by #${match}`)
          router.push(`/?tag=${encodeURIComponent(match)}`)
        },
        goto: () => {
          if (!arg.startsWith('/')) {
            push('error', "goto: path must start with '/'")
            return
          }
          push('output', `→ ${arg}`)
          router.push(arg)
        },
        theme: () => {
          const mode = arg.toLowerCase()
          if (mode !== 'light' && mode !== 'dark' && mode !== 'system') {
            push('error', 'theme: usage — theme light | dark | system')
            return
          }
          setTheme(mode)
          push('output', `→ theme set to ${mode}`)
        },
        subscribe: () => {
          push('output', '→ /newsletter — the bi-weekly dispatch')
          router.push('/newsletter')
        },
        rss: () => {
          void globalThis.navigator.clipboard.writeText(`${globalThis.location.origin}/feed.xml`)
          push('output', '→ rss feed url copied to clipboard')
        },
        date: () => {
          push('output', new Date().toString())
        },
        echo: () => {
          push('output', arg)
        },
        sysinfo: () => {
          push(
            'output',
            [
              `host      : ${globalThis.location.host} — guest shell (tty1)`,
              `session   : read-only · ${posts.length} dispatches indexed`,
              `viewport  : ${globalThis.innerWidth}×${globalThis.innerHeight} @ ${globalThis.devicePixelRatio}x`,
              `theme     : ${theme}`,
              `clock     : ${new Date().toUTCString()}`
            ].join('\n')
          )
        },
        history: () => {
          if (historyRef.current.length === 0) {
            push('output', 'history: empty')
            return
          }
          push(
            'output',
            historyRef.current
              .map((cmd, i) => `${String(i + 1).padStart(3, ' ')}  ${cmd}`)
              .join('\n')
          )
        },
        sudo: () => {
          push(
            'error',
            'sudo: guest is not in the sudoers file. this incident will be reported to /dev/null.'
          )
        },
        exit: () => {
          push(
            'output',
            'logout — connection to blog closed. (the reading session persists anyway)'
          )
        }
      }

      const handler = handlers[command.toLowerCase()]
      if (!handler) {
        push('error', `sh: command not found: ${command} — type 'help'`)
        return
      }
      handler()
    },
    [posts, push, router, setTheme, theme]
  )

  const runCommand = useCallback(
    (raw: string) => {
      const input = raw.trim()

      if (input.toLowerCase() === 'clear') {
        setLines([])
        return
      }

      push('input', `${PROMPT} ${input}`)
      if (!input) return

      historyRef.current = [...historyRef.current.slice(-49), input]
      historyIndexRef.current = null

      const [command = '', ...args] = input.split(/\s+/)
      executeCommand(command, args.join(' '))
    },
    [executeCommand, push]
  )

  const moveHistory = (direction: 'up' | 'down') => {
    const history = historyRef.current
    if (direction === 'up') {
      if (history.length === 0) return
      const index =
        historyIndexRef.current === null
          ? history.length - 1
          : Math.max(0, historyIndexRef.current - 1)
      historyIndexRef.current = index
      setValue(history[index] ?? '')
      return
    }

    if (historyIndexRef.current === null) return
    const next = historyIndexRef.current + 1
    if (next >= history.length) {
      historyIndexRef.current = null
      setValue('')
    } else {
      historyIndexRef.current = next
      setValue(history[next] ?? '')
    }
  }

  const completeCommand = () => {
    const head = value.split(/\s+/)[0]
    if (!head) return
    const match = COMMANDS.find((cmd) => cmd.startsWith(head.toLowerCase()))
    if (match) setValue(`${match} `)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setLines([])
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(value)
      setValue('')
      return
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      moveHistory(e.key === 'ArrowUp' ? 'up' : 'down')
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      completeCommand()
    }
  }

  return (
    <Frame aria-label='Interactive guest terminal' className={className}>
      <StripHeader
        left={
          <>
            <SquareTerminalIcon className='text-foreground size-3' aria-hidden />
            <span className='text-foreground font-semibold'>
              Guest shell // tty1 — reader terminal
            </span>
          </>
        }
        right={<span>bash · read-only</span>}
      />

      {/* Label semantics: clicking anywhere in the transcript focuses the input */}
      <label
        htmlFor='guest-terminal-input'
        className='bg-background/60 block cursor-text focus-within:outline-none'
      >
        <div
          ref={scrollRef}
          className='h-80 space-y-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed sm:px-5'
        >
          {lines.map((line) => (
            <p
              key={line.id}
              className={cn(
                'break-words whitespace-pre-wrap',
                line.kind === 'system' && 'text-muted-foreground',
                line.kind === 'input' && 'text-muted-foreground/80',
                line.kind === 'error' && 'text-foreground',
                line.kind === 'output' && 'text-foreground/90'
              )}
            >
              {line.kind === 'error' && <span aria-hidden>✗ </span>}
              {line.text}
            </p>
          ))}

          {/* Live prompt row — the real input overlays it invisibly to hold focus */}
          <div className='relative flex items-start gap-2 pt-1'>
            <span className='text-muted-foreground shrink-0'>{PROMPT}</span>
            <span className='text-foreground relative min-w-0 flex-1 break-words whitespace-pre-wrap'>
              {value}
              <span
                aria-hidden
                className='bg-foreground ml-0.5 inline-block h-3.5 w-[7px] animate-pulse align-middle'
              />
            </span>
            <input
              ref={inputRef}
              id='guest-terminal-input'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label='Guest terminal input'
              autoComplete='off'
              autoCapitalize='off'
              autoCorrect='off'
              spellCheck={false}
              className='absolute inset-0 size-full cursor-text opacity-0'
            />
          </div>
        </div>
      </label>

      <div className='border-border text-muted-foreground/70 flex items-center justify-between gap-2 border-t px-4 py-2 font-mono text-[9px] tracking-widest uppercase sm:px-5'>
        <span>type 'help' — ↑↓ history — tab completes</span>
        <span className='hidden sm:inline'>session: guest // clearance: read-only</span>
      </div>
    </Frame>
  )
}

export default TerminalConsole
