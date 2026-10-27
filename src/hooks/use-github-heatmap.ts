'use client'

import { useEffect, useMemo, useState } from 'react'

export interface HeatmapData {
  cells: Array<number | null>
  total: number
  live: boolean
}

interface ContributionItem {
  date: string
  count: number
  level: number
}

interface ContributionApiResponse {
  total?: {
    lastYear?: number
    [key: string]: number | undefined
  }
  contributions?: ContributionItem[]
}

function getBucketLevel(v: number): number {
  if (v < 34) return 0
  if (v < 60) return 1
  if (v < 80) return 2
  if (v < 93) return 3
  return 4
}

/** Deterministic pseudo-random fallback so the section never looks empty or broken */
function buildFallbackHeatmap(seedText: string): HeatmapData {
  let seed = 5381
  for (let i = 0; i < seedText.length; i++) {
    seed = (seed * 33) ^ (seedText.codePointAt(i) ?? 0)
  }
  const cells: Array<number | null> = []
  let s = seed >>> 0
  for (let i = 0; i < 53 * 7; i++) {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0
    cells.push(getBucketLevel(s % 100))
  }
  return {
    cells,
    total: cells.reduce<number>((a, b) => a + (b ?? 0) * 2, 0),
    live: false
  }
}

/** Live GitHub contributions for the last year (public API, no auth required) */
export function useGithubHeatmap(user: string): HeatmapData {
  const fallback = useMemo(() => buildFallbackHeatmap(user), [user])
  const [heatmap, setHeatmap] = useState<HeatmapData>(fallback)

  useEffect(() => {
    let cancelled = false

    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch github activity')
        return res.json() as Promise<ContributionApiResponse>
      })
      .then((data) => {
        const contribs = data.contributions ?? []
        if (cancelled || contribs.length === 0) return

        // Pad with nulls so the first column starts on the correct day of week
        const firstDow = new Date(contribs[0]!.date).getDay()
        const emptyPadding: Array<number | null> = Array.from(
          { length: firstDow },
          () => null
        )
        const levels: Array<number | null> = contribs.map((c) => c.level)
        const cells: Array<number | null> = [...emptyPadding, ...levels]

        const total =
          data.total?.lastYear ??
          contribs.reduce((a, c) => a + c.count, 0)

        setHeatmap({ cells, total, live: true })
      })
      .catch(() => {
        // Keep fallback on network error or rate limit
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return heatmap
}
