import type { Metadata } from "next";

import { redirect } from "next/navigation";

import PageHeader from "@/components/page-header";
import { Frame, FrameBody, FrameHeader } from "@/components/frame";
import NewPostButton from "@/components/new-post-button";
import { getCurrentUser } from "@/lib/auth";
import { getPostsByUserId } from "@/queries/get-posts-by-user-id";

import PostsClient from "./page.client";

export const metadata: Metadata = {
  title: "Your posts",
};

const PostsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/me/posts");
  }

  const { posts } = await getPostsByUserId(user.id);

  const formattedUser = {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };

  const postsWithDates = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
  }));

  const isAdmin = user.role === "admin";

  return (
    <div className="relative z-10 w-full space-y-6">
      <PageHeader
        title="Your posts"
        description={
          isAdmin
            ? "Manage your drafts and published posts. Start a new post anytime!"
            : "All the posts you have liked will appear here."
        }
      />
      <Frame>
        <FrameHeader label="Library" />
        <FrameBody>
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <NewPostButton />
            </div>
          )}
          <PostsClient posts={postsWithDates} user={formattedUser} />
        </FrameBody>
      </Frame>
    </div>
  );
};

export default PostsPage;
