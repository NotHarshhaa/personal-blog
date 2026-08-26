const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

const hashString = (value: string) => {
  let hash = FNV_OFFSET;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0;
};

export const getSeededViewCount = (postId: string, createdAt: Date) => {
  const hash = hashString(postId);
  const daysOnline = Math.max(
    1,
    Math.floor((Date.now() - createdAt.getTime()) / 86_400_000),
  );
  // Base views range between 1,450 and 4,900
  const base = 1450 + (hash % 3450);
  // Daily velocity between 42 and 130 views/day
  const daily = 42 + (hash % 88);

  return base + daysOnline * daily;
};

export const getFakeEngagement = (postId: string, createdAt: Date) => {
  const fakeViews = getSeededViewCount(postId, createdAt);
  const hash = hashString(`likes-${postId}`);
  // Natural tech post like conversion rate: ~5.2% to 8.4%
  const rate = 0.052 + (hash % 32) / 1000;
  const calculatedLikes = Math.round(fakeViews * rate);
  const baseLikes = 35 + (hash % 45);

  return {
    fakeViews,
    fakeLikes: Math.max(baseLikes, calculatedLikes),
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
    likes: Array<unknown>;
  },
>(
  post: T,
) => {
  const published = post.published ?? true;
  const seeded = getFakeEngagement(post.id, post.createdAt);
  const effectiveFakeViews = Math.max(post.fakeViews, seeded.fakeViews);
  const effectiveFakeLikes = Math.max(post.fakeLikes, seeded.fakeLikes);

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
