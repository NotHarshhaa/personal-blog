const FNV_OFFSET = 2_166_136_261;
const FNV_PRIME = 16_777_619;

const hashString = (value: string) => {
  let hash = FNV_OFFSET;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.codePointAt(i) ?? 0;
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0;
};

export const getSeededViewCount = (postId: string, createdAt: Date) => {
  const hash = hashString(postId);
  const ageMs = Math.max(0, Date.now() - createdAt.getTime());
  const ageHours = ageMs / 3_600_000;
  const ageDays = ageMs / 86_400_000;

  // Starter boost for fresh posts so they never look empty: 15-25 views
  const starterViews = 15 + (hash % 11);

  // Base mature views range between 1,450 and 4,900
  const base = 1450 + (hash % 3450);
  // Daily velocity between 42 and 130 views/day after maturity
  const daily = 42 + (hash % 88);

  // Ramp-up period: 3 days (72 hours) to smoothly scale from starter to base views
  const RAMP_HOURS = 72;
  if (ageHours < RAMP_HOURS) {
    const progress = ageHours / RAMP_HOURS;
    // Power curve (exponent 1.4) allows gentle, organic progression from starter up to base
    const curve = Math.pow(progress, 1.4);
    return Math.round(starterViews + (base - starterViews) * curve);
  }

  // Beyond 3 days: mature base views + daily velocity for additional days online
  const matureDays = ageDays - (RAMP_HOURS / 24);
  return Math.round(base + matureDays * daily);
};

export const getFakeEngagement = (postId: string, createdAt: Date) => {
  const hash = hashString(postId);
  const fakeViews = getSeededViewCount(postId, createdAt);

  // Starter likes for fresh posts: 1-2 likes
  const starterLikes = 1 + ((hash >> 4) % 2);

  const likeHash = hashString(`likes-${postId}`);
  // Natural tech post like conversion rate: ~5.2% to 8.4%
  const rate = 0.052 + (likeHash % 32) / 1000;
  const calculatedLikes = Math.round(fakeViews * rate);

  return {
    fakeViews,
    fakeLikes: Math.max(starterLikes, calculatedLikes),
  };
};

export const getDisplayViewCount = (
  storedViews: number,
  fakeViews: number,
  published = true,
) => {
  if (!published) {
    return 0;
  }

  return storedViews + fakeViews;
};

export const getDisplayLikeCount = (
  realLikes: number,
  fakeLikes: number,
  published = true,
) => {
  if (!published) {
    return realLikes;
  }

  return realLikes + fakeLikes;
};

export const withPostEngagement = <
  T extends {
    id: string;
    createdAt: Date;
    views: number;
    fakeViews: number;
    fakeLikes: number;
    published?: boolean;
    likes: unknown[];
  },
>(
  post: T,
) => {
  const published = post.published ?? true;
  const seeded = getFakeEngagement(post.id, post.createdAt);
  const effectiveFakeViews = seeded.fakeViews;
  const effectiveFakeLikes = seeded.fakeLikes;

  const views = getDisplayViewCount(post.views, effectiveFakeViews, published);
  const likeCount = getDisplayLikeCount(
    post.likes.length,
    effectiveFakeLikes,
    published,
  );

  return {
    ...post,
    views,
    likeCount,
  };
};
