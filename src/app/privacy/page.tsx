import type { Metadata } from 'next'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your data at DevOps & Cloud Space.'
}

const PrivacyPage = () => (
  <div className="relative z-10 flex w-full flex-col items-center py-4">
    <Frame className="w-full max-w-3xl">
      <FrameHeader label="Legal" />
      <FrameBody className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Your privacy is important to us. This policy explains what
            information we collect, how we use it, and your rights.
          </p>
        </div>
        <section>
          <h2 className="mb-1 text-base font-semibold">1. What Data We Collect</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Account info (name, email, profile image, social links)</li>
            <li>Posts, comments, and likes you create</li>
            <li>Login and authentication data (via Google or other providers)</li>
            <li>Usage data (e.g., page visits, device info, cookies)</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-1 text-base font-semibold">2. How We Use Your Data</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>To provide and improve our blog platform</li>
            <li>To personalize your experience</li>
            <li>To keep your account secure</li>
            <li>To communicate with you about updates or support</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-1 text-base font-semibold">3. Third-Party Services</h2>
          <p className="text-sm text-muted-foreground">
            We use third-party services (like Google for login) that may collect
            data according to their own privacy policies.
          </p>
        </section>
        <section>
          <h2 className="mb-1 text-base font-semibold">4. Cookies</h2>
          <p className="text-sm text-muted-foreground">
            We use cookies to keep you logged in and to analyze site usage. You
            can control cookies in your browser settings.
          </p>
        </section>
        <section>
          <h2 className="mb-1 text-base font-semibold">5. Your Rights</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>You can update or delete your account at any time in settings</li>
            <li>
              You can contact us to request data deletion or for any privacy
              concerns
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-1 text-base font-semibold">6. Contact</h2>
          <p className="text-sm text-muted-foreground">
            If you have questions or concerns about your privacy, email us at{' '}
            <a
              href="mailto:harshhaa03@gmail.com"
              className="underline underline-offset-2 hover:text-foreground"
            >
              harshhaa03@gmail.com
            </a>
            .
          </p>
        </section>
        <div className="border-t border-border pt-4 text-xs text-muted-foreground">
          Last updated: {new Date().getFullYear()}
        </div>
      </FrameBody>
    </Frame>
  </div>
)

export default PrivacyPage
