import { redirect } from "next/navigation";

import { Frame, FrameBody, FrameHeader } from "@/components/frame";
import RefreshEngagementButton from "@/components/refresh-engagement-button";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (user?.role !== "admin") {
    redirect("/not-authorized"); // or just '/'
  }

  return (
    <main className="space-y-6 p-8">
      <Frame as="header">
        <FrameHeader label="Admin" />
        <FrameBody className="space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
        </FrameBody>
      </Frame>
      <Frame as="section">
        <FrameHeader label="Article metrics" />
        <FrameBody className="space-y-3">
          <h2 className="text-lg font-semibold">Recalculate article metrics</h2>
          <p className="text-sm text-muted-foreground">
            Synchronize baseline views and engagement metrics for published
            articles based on their publication date and reader velocity. Drafts
            keep their private counters hidden.
          </p>
          <RefreshEngagementButton />
        </FrameBody>
      </Frame>
    </main>
  );
}
