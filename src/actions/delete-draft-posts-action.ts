"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { authenticatedActionClient } from "@/lib/safe-action";

export const deleteDraftPostsAction = authenticatedActionClient.action(
  async ({ ctx: { user } }) => {
    await db
      .delete(posts)
      .where(and(eq(posts.authorId, user.id), eq(posts.published, false)));

    revalidatePath("/me/posts");
  },
);
