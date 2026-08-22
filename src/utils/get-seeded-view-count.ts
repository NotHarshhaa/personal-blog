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
  const base = 120 + (hash % 181);
  const daily = 6 + (hash % 9);

  return base + daysOnline * daily;
};

export const getFakeEngagement = (postId: string, createdAt: Date) => {
  const fakeViews = getSeededViewCount(postId, createdAt);
  const hash = hashString(`likes-${postId}`);
  const rate = 0.035 + (hash % 21) / 1000;

  return {
    fakeViews,
    fakeLikes: Math.round(fakeViews * rate),
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
  const views = getDisplayViewCount(post.views, post.fakeViews, published);
  const likeCount = getDisplayLikeCount(
    post.likes.length,
    post.fakeLikes,
    published,
  );

  return {
    ...post,
    views,
    likeCount,
  };
};
