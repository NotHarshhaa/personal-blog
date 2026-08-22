import { Frame, FrameBody, FrameHeader } from "@/components/frame";
import RefreshFakeEngagementButton from "@/components/refresh-fake-engagement-button";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
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
        <FrameHeader label="Article engagement" />
        <FrameBody className="space-y-3">
          <h2 className="text-lg font-semibold">Refresh article metrics</h2>
          <p className="text-sm text-muted-foreground">
            Generate balanced fake views and likes for published posts using
            their creation date and the current time. Drafts keep their private
            engagement counters hidden.
          </p>
          <RefreshFakeEngagementButton />
        </FrameBody>
      </Frame>
    </main>
  );
}
