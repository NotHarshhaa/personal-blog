import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your data at DevOps & Cloud Space.'
}

const PrivacyPage = () => (
  <div className="min-h-content flex w-full flex-col items-center justify-center p-4">
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-xl px-8 py-10 flex flex-col gap-6 backdrop-blur-md">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        Your privacy is important to us. This policy explains what information we collect, how we use it, and your rights.
      </p>
      <section>
        <h2 className="text-xl font-semibold mb-1">1. What Data We Collect</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Account info (name, email, profile image, social links)</li>
          <li>Posts, comments, and likes you create</li>
          <li>Login and authentication data (via Google or other providers)</li>
          <li>Usage data (e.g., page visits, device info, cookies)</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-1">2. How We Use Your Data</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>To provide and improve our blog platform</li>
          <li>To personalize your experience</li>
          <li>To keep your account secure</li>
          <li>To communicate with you about updates or support</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-1">3. Third-Party Services</h2>
        <p className="text-muted-foreground">
          We use third-party services (like Google for login) that may collect data according to their own privacy policies.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-1">4. Cookies</h2>
        <p className="text-muted-foreground">
          We use cookies to keep you logged in and to analyze site usage. You can control cookies in your browser settings.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-1">5. Your Rights</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>You can update or delete your account at any time in settings</li>
          <li>You can contact us to request data deletion or for any privacy concerns</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-1">6. Contact</h2>
        <p className="text-muted-foreground">
          If you have questions or concerns about your privacy, email us at <a href="mailto:harshhaa03@gmail.com" className="underline hover:text-primary">harshhaa03@gmail.com</a>.
        </p>
      </section>
      <div className="text-xs text-muted-foreground mt-6">Last updated: {new Date().getFullYear()}</div>
    </div>
  </div>
)

export default PrivacyPage
