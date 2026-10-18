const FNV_OFFSET = 2_166_136_261
const FNV_PRIME = 16_777_619

const hashString = (value: string) => {
  let hash = FNV_OFFSET

  for (let i = 0; i < value.length; i++) {
    hash ^= value.codePointAt(i) ?? 0
    hash = Math.imul(hash, FNV_PRIME)
  }

  return hash >>> 0
}

export const getSeededViewCount = (postId: string, createdAt: Date) => {
  const hash = hashString(postId)
  const reachHash = hashString(`reach:${postId}`)
  const ageMs = Math.max(0, Date.now() - createdAt.getTime())
  const ageHours = ageMs / 3_600_000

  // Post performance archetypes based on deterministic hash:
  // - Breakout / Viral (12%): Rapid early pickup (aggregators, social shares)
  // - Trending / Featured (28%): High interest, prominent spotlight
  // - Standard / Steady (42%): Normal organic developer readership
  // - Niche / Deep Dive (18%): Highly focused technical audience
  const tierRoll = (reachHash >>> 0) % 100

  let launchViews: number
  let day1Views: number
  let matureBase: number
  let dailyVelocity: number

  if (tierRoll < 12) {
    // Viral / Breakout
    launchViews = 160 + (hash % 120)
    day1Views = 1200 + (hash % 1400)
    matureBase = 3800 + (hash % 4200)
    dailyVelocity = 65 + (hash % 85)
  } else if (tierRoll < 40) {
    // Trending / Featured
    launchViews = 60 + (hash % 50)
    day1Views = 340 + (hash % 420)
    matureBase = 2100 + (hash % 2400)
    dailyVelocity = 35 + (hash % 50)
  } else if (tierRoll < 82) {
    // Standard / Steady
    launchViews = 24 + (hash % 26)
    day1Views = 85 + (hash % 125)
    matureBase = 1100 + (hash % 1300)
    dailyVelocity = 16 + (hash % 28)
  } else {
    // Niche / Deep Dive
    launchViews = 12 + (hash % 16)
    day1Views = 45 + (hash % 60)
    matureBase = 480 + (hash % 700)
    dailyVelocity = 8 + (hash % 16)
  }

  // Phase 1: Day 1 (0 to 24h) - organic ease-out curve from immediate launch to day-1 baseline
  if (ageHours <= 24) {
    const progress = Math.max(0, ageHours / 24)
    const ease = 1 - Math.pow(1 - progress, 2.2)
    return Math.round(launchViews + (day1Views - launchViews) * ease)
  }

  // Phase 2: Days 2 to 3 (24h to 72h) - transition from day-1 traction to mature baseline
  if (ageHours <= 72) {
    const progress = (ageHours - 24) / 48
    const ease = Math.sin((progress * Math.PI) / 2)
    return Math.round(day1Views + (matureBase - day1Views) * ease)
  }

  // Phase 3: Beyond 3 days - mature base + steady daily accumulation over time
  const matureDays = (ageHours - 72) / 24
  return Math.round(matureBase + matureDays * dailyVelocity)
}

export const getBaselineEngagement = (postId: string, createdAt: Date) => {
  const baselineViews = getSeededViewCount(postId, createdAt)

  const likeHash = hashString(`likes:${postId}`)
  const likeRoll = (likeHash >>> 0) % 100

  let rate: number
  let starterLikes: number

  // Decouple like sentiment from raw views so posts have unique engagement personalities:
  // - High-Appreciation (20%): Deep bookmarks & high ratio (10.5% - 15.5%) + early enthusiast likes
  // - Strong Engagement (35%): Broadly liked content (7.2% - 10.0%)
  // - Standard (30%): Typical reader reaction (4.8% - 6.8%)
  // - Skimmed / High-Traffic (15%): High views but lower like conversion (3.0% - 4.5%)
  if (likeRoll < 20) {
    rate = 0.105 + (likeHash % 50) / 1000
    starterLikes = 6 + (likeHash % 12)
  } else if (likeRoll < 55) {
    rate = 0.072 + (likeHash % 28) / 1000
    starterLikes = 3 + (likeHash % 6)
  } else if (likeRoll < 85) {
    rate = 0.048 + (likeHash % 20) / 1000
    starterLikes = 1 + (likeHash % 4)
  } else {
    rate = 0.03 + (likeHash % 15) / 1000
    starterLikes = 1 + (likeHash % 2)
  }

  const calculatedLikes = Math.round(baselineViews * rate)

  return {
    baselineViews,
    baselineLikes: Math.max(starterLikes, calculatedLikes)
  }
}

export const getDisplayViewCount = (
  storedViews: number,
  baselineViews: number,
  published = true
) => {
  if (!published) {
    return 0
  }

  return storedViews + baselineViews
}

export const getDisplayLikeCount = (realLikes: number, baselineLikes: number, published = true) => {
  if (!published) {
    return realLikes
  }

  return realLikes + baselineLikes
}

export const withPostEngagement = <
  T extends {
    id: string
    createdAt: Date
    views: number
    baselineViews: number
    baselineLikes: number
    published?: boolean
    likes: unknown[]
  }
>(
  post: T
) => {
  const published = post.published ?? true
  const baseline = getBaselineEngagement(post.id, post.createdAt)
  const effectiveBaselineViews = baseline.baselineViews
  const effectiveBaselineLikes = baseline.baselineLikes

  const views = getDisplayViewCount(post.views, effectiveBaselineViews, published)
  const likeCount = getDisplayLikeCount(post.likes.length, effectiveBaselineLikes, published)

  return {
    ...post,
    views,
    likeCount
  }
}
