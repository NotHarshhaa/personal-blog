"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { authenticatedActionClient } from "@/lib/safe-action";
import { getBaselineEngagement } from "@/utils/get-seeded-view-count";

export const refreshEngagementAction = authenticatedActionClient.action(
  async ({ ctx: { user } }) => {
    if (user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const allPosts = await db.query.posts.findMany({
      columns: {
        id: true,
        createdAt: true,
        published: true,
      },
    });

    let totalBaselineViews = 0;
    let totalBaselineLikes = 0;

    await db.transaction(async (tx) => {
      for (const post of allPosts) {
        if (!post.published) {
          await tx
            .update(posts)
            .set({ baselineViews: 0, baselineLikes: 0 })
            .where(eq(posts.id, post.id));
          continue;
        }

        const calculated = getBaselineEngagement(post.id, post.createdAt);
        const { baselineViews, baselineLikes } = calculated;

        totalBaselineViews += baselineViews;
        totalBaselineLikes += baselineLikes;

        await tx
          .update(posts)
          .set({ baselineViews, baselineLikes })
          .where(eq(posts.id, post.id));
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/me/posts");
    revalidatePath("/users");

    return {
      updatedPosts: allPosts.length,
      totalViews: totalBaselineViews,
      totalLikes: totalBaselineLikes,
    };
  },
);
