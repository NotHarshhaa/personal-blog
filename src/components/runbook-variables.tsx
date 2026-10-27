'use client'

import {
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Terminal,
  X
} from 'lucide-react'
import {
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { toast } from 'sonner'

import { CornerBrackets } from '@/components/frame'
import { cn } from '@/lib/utils'

type RunbookContextType = {
  variables: Record<string, string>
  defaults: Record<string, string>
  setVariable: (key: string, value: string) => void
  addVariable: (key: string, defaultValue?: string) => void
  removeVariable: (key: string) => void
  resetVariables: () => void
  substitute: (text: string) => string
  hasCustomizations: boolean
  activeCount: number
}

const RunbookContext = createContext<RunbookContextType | null>(null)
RunbookContext.displayName = 'RunbookContext'

// Non-parameter shell built-ins to ignore
const IGNORED_SHELL_VARS = new Set([
  'PATH',
  'HOME',
  'USER',
  'SHELL',
  'PWD',
  'TERM',
  'LANG',
  'UID',
  'PID',
  'IFS',
  'RANDOM',
  'HOSTNAME',
  'LOGNAME',
  'MAIL',
  'EDITOR',
  'OLDPWD',
  'SHLVL',
  'OSTYPE',
  'MACHTYPE'
])

// Typical DevOps default values for commonly encountered parameters
const COMMON_PARAM_DEFAULTS: Record<string, string> = {
  NAMESPACE: 'production',
  AWS_REGION: 'us-east-1',
  CLUSTER_NAME: 'k8s-platform-prod',
  ENVIRONMENT: 'production',
  DOMAIN: 'example.internal',
  DOMAIN_NAME: 'example.internal',
  PROJECT_ID: 'cloud-platform-prod',
  IMAGE_TAG: 'v1.4.0',
  RELEASE_NAME: 'core-app',
  REPLICAS: '3',
  VPC_ID: 'vpc-0a1b2c3d4e5f',
  SUBNET_ID: 'subnet-0123456789abcdef',
  PORT: '8080'
}

/**
 * Scans article HTML/text for `$VARIABLE` or `${VARIABLE}` parameter patterns.
 */
export const scanContentForVariables = (content: string): Record<string, string> => {
  if (!content) return {}

  const detected: Record<string, string> = {}
  // Matches $UPPER_CASE_VAR or ${UPPER_CASE_VAR} with at least 3 uppercase/digit/underscore chars
  const regex = /\$(?:\{([A-Z][A-Z0-9_]{2,})\}|([A-Z][A-Z0-9_]{2,}))/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const varName = match[1] ?? match[2]
    if (!varName || IGNORED_SHELL_VARS.has(varName)) continue

    if (!(varName in detected)) {
      detected[varName] = COMMON_PARAM_DEFAULTS[varName] ?? varName.toLowerCase()
    }
  }

  return detected
}

type RunbookProviderProps = {
  children: ReactNode
  content?: string
  initialVariables?: Record<string, string>
}

export const RunbookProvider = ({
  children,
  content = '',
  initialVariables
}: RunbookProviderProps) => {
  // Extract detected variables from content on mount
  const scannedDefaults = useMemo(() => {
    const fromContent = scanContentForVariables(content)
    return { ...fromContent, ...initialVariables }
  }, [content, initialVariables])

  const [defaults, setDefaults] = useState<Record<string, string>>(scannedDefaults)
  const [variables, setVariables] = useState<Record<string, string>>(scannedDefaults)

  // Sync if content changes
  useEffect(() => {
    setDefaults(scannedDefaults)
    setVariables((prev) => {
      const merged = { ...scannedDefaults }
      for (const [k, v] of Object.entries(prev)) {
        if (k in merged) {
          merged[k] = v
        }
      }
      return merged
    })
  }, [scannedDefaults])

  const setVariable = useCallback((key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }))
  }, [])

  const addVariable = useCallback((key: string, defaultValue = '') => {
    const cleanKey = key.replace(/^\$+/, '').trim().toUpperCase()
    if (!cleanKey) return
    const initialVal = defaultValue || cleanKey.toLowerCase()
    setDefaults((prev) => ({ ...prev, [cleanKey]: initialVal }))
    setVariables((prev) => ({ ...prev, [cleanKey]: initialVal }))
  }, [])

  const removeVariable = useCallback((key: string) => {
    setVariables((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)))
    setDefaults((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)))
  }, [])

  const resetVariables = useCallback(() => {
    setVariables(defaults)
    toast.success('Runbook parameters reset to defaults')
  }, [defaults])

  const hasCustomizations = useMemo(() => {
    return Object.keys(variables).some((k) => variables[k] !== defaults[k])
  }, [variables, defaults])

  const activeCount = useMemo(() => Object.keys(variables).length, [variables])

  /**
   * Replaces occurrences of `$KEY` and `${KEY}` with the active customized value.
   */
  const substitute = useCallback(
    (text: string): string => {
      if (!text || Object.keys(variables).length === 0) return text

      let result = text
      for (const [key, val] of Object.entries(variables)) {
        if (!val) continue
        // Replace ${KEY} first, then $KEY (with word boundary / non-alphanumeric trailing check)
        const bracedRegex = new RegExp(`\\$\\{${key}\\}`, 'g')
        const bareRegex = new RegExp(`\\$${key}(?![A-Za-z0-9_])`, 'g')
        result = result.replace(bracedRegex, val).replace(bareRegex, val)
      }
      return result
    },
    [variables]
  )

  const value = useMemo(
    () => ({
      variables,
      defaults,
      setVariable,
      addVariable,
      removeVariable,
      resetVariables,
      substitute,
      hasCustomizations,
      activeCount
    }),
    [
      variables,
      defaults,
      setVariable,
      addVariable,
      removeVariable,
      resetVariables,
      substitute,
      hasCustomizations,
      activeCount
    ]
  )

  return <RunbookContext value={value}>{children}</RunbookContext>
}

const noop = () => {
  // no-op fallback when used outside provider
}

/** Hook to consume runbook environment parameters anywhere inside the article */
export const useRunbookVariables = () => {
  const context = use(RunbookContext)
  if (!context) {
    // Safe fallback when used outside RunbookProvider
    return {
      variables: {},
      defaults: {},
      setVariable: noop,
      addVariable: noop,
      removeVariable: noop,
      resetVariables: noop,
      substitute: (t: string) => t,
      hasCustomizations: false,
      activeCount: 0
    }
  }
  return context
}

/**
 * Top-of-article interactive input bar allowing readers to customize
 * $NAMESPACE, $AWS_REGION, $CLUSTER_NAME, etc., dynamically updating code blocks.
 */
export const RunbookVariablesBar = ({ className }: { className?: string }) => {
  const {
    variables,
    defaults,
    setVariable,
    addVariable,
    removeVariable,
    resetVariables,
    hasCustomizations,
    activeCount
  } = useRunbookVariables()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  // If article has no detected variables, keep bar hidden unless reader wants to add one
  if (activeCount === 0 && !isAddingNew) {
    return (
      <div className={cn('not-prose my-4 flex items-center justify-between text-xs', className)}>
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-1.5 border border-dashed border-border bg-card/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="size-3" />
          <span>+ Parameterize Runbook (Inject Custom Variables)</span>
        </button>
      </div>
    )
  }

  const handleAddNewSubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    if (!newKey.trim()) return
    addVariable(newKey, newVal)
    setNewKey('')
    setNewVal('')
    setIsAddingNew(false)
    toast.success(`Parameter $${newKey.trim().toUpperCase()} added`)
  }

  return (
    <div
      className={cn(
        'not-prose relative my-6 w-full border border-border bg-card text-foreground select-none',
        className
      )}
    >
      <CornerBrackets />

      {/* Blueprint Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-3.5 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-foreground" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-foreground">
            Runbook Parameters // Live Code Injection
          </span>
          <span className="border border-border bg-background px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground">
            {activeCount} {activeCount === 1 ? 'variable' : 'variables'}
          </span>
          {hasCustomizations && (
            <span className="inline-flex items-center gap-1 border border-foreground/30 bg-foreground/10 px-1.5 py-0.2 font-mono text-[9px] font-medium text-foreground">
              <span className="size-1.5 animate-pulse bg-foreground" />
              Customized
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hasCustomizations && (
            <button
              type="button"
              onClick={resetVariables}
              title="Reset parameters to article defaults"
              className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <RefreshCw className="size-2.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse parameters' : 'Expand parameters'}
            className="border border-border bg-background p-1 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="space-y-3 p-3.5 sm:p-4">
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            Type your custom values below. All terminal commands, Kubernetes manifests, and
            configurations on this page will automatically update before you copy them.
          </p>

          {/* Variables Grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(variables).map(([key, val]) => {
              const isModified = val !== defaults[key]

              return (
                <div
                  key={key}
                  className={cn(
                    'flex items-center border bg-background font-mono text-xs transition-colors',
                    isModified ? 'border-foreground ring-1 ring-foreground/20' : 'border-border'
                  )}
                >
                  {/* Label / Key */}
                  <span className="flex shrink-0 items-center gap-1 border-r border-border bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground">
                    ${key}
                  </span>

                  {/* Editable Value */}
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setVariable(key, e.target.value)}
                    placeholder={defaults[key] ?? 'value...'}
                    className="w-full min-w-0 bg-transparent px-2 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />

                  {/* Remove custom param if not in original defaults */}
                  {!(key in defaults) && (
                    <button
                      type="button"
                      onClick={() => removeVariable(key)}
                      title="Remove parameter"
                      className="px-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add Custom Variable Form */}
          {isAddingNew ? (
            <form
              onSubmit={handleAddNewSubmit}
              className="flex flex-wrap items-center gap-2 border border-dashed border-border bg-background/50 p-2 font-mono text-xs"
            >
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="PARAM_NAME"
                  className="w-32 border border-border bg-background px-2 py-1 font-mono text-[11px] uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground/40 focus:border-foreground focus:outline-none"
                />
              </div>
              <span className="text-muted-foreground">=</span>
              <input
                type="text"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                placeholder="custom-value"
                className="w-40 border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 border border-foreground bg-foreground px-2 py-1 font-mono text-[10px] text-background transition-colors hover:bg-foreground/90"
              >
                <CornerDownLeft className="size-3" />
                <span>Inject</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-muted-foreground">
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1 border border-dashed border-border px-2 py-0.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <Plus className="size-2.5" />
                <span>Add custom variable</span>
              </button>
              <span className="hidden sm:inline opacity-70">
                Variables auto-inject into all code blocks & copy buttons
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RunbookVariablesBar
