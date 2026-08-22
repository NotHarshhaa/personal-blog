"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { authenticatedActionClient } from "@/lib/safe-action";
import { getFakeEngagement } from "@/utils/get-seeded-view-count";

export const refreshFakeEngagementAction = authenticatedActionClient.action(
  async ({ ctx: { user } }) => {
    if (user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const allPosts = await db.query.posts.findMany({
      columns: {
        id: true,
        createdAt: true,
      },
    });

    let totalFakeViews = 0;
    let totalFakeLikes = 0;

    await db.transaction(async (tx) => {
      for (const post of allPosts) {
        const calculated = getFakeEngagement(post.id, post.createdAt);
        const { fakeViews, fakeLikes } = calculated;

        totalFakeViews += fakeViews;
        totalFakeLikes += fakeLikes;

        await tx
          .update(posts)
          .set({ fakeViews, fakeLikes })
          .where(eq(posts.id, post.id));
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/me/posts");
    revalidatePath("/users");

    return {
      updatedPosts: allPosts.length,
      totalFakeViews,
      totalFakeLikes,
    };
  },
);
