import { Resend } from 'resend'

export type EmailDispatchPost = {
  id: string
  title: string
  description?: string | null
  content?: string | null
  tags?: string[]
  createdAt: Date
  author: {
    name: string
  }
}

export type EmailCompileOptions = {
  siteUrl: string
  unsubscribeUrl: string
  issueNumber?: number | string
}

/**
 * Clean and format HTML content into email-safe monospace markup
 */
function sanitizeContentForEmail(rawHtml: string): string {
  if (!rawHtml) return ''

  return (
    rawHtml
      // Style headings
      .replaceAll(/<h1[^>]*>(.*?)<\/h1>/gi, '<h1 style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 20px; font-weight: 700; color: #111111; margin: 24px 0 12px 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">// $1</h1>')
      .replaceAll(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2 style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; color: #111111; margin: 20px 0 10px 0; border-bottom: 1px solid #eeeeee; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">// $1</h2>')
      .replaceAll(/<h3[^>]*>(.*?)<\/h3>/gi, '<h3 style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; font-weight: 600; color: #222222; margin: 16px 0 8px 0; letter-spacing: 0.02em;">$1</h3>')
      // Style paragraphs
      .replaceAll(/<p[^>]*>(.*?)<\/p>/gi, '<p style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.7; color: #333333; margin: 0 0 14px 0;">$1</p>')
      // Style code blocks
      .replaceAll(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '<pre style="background-color: #0f1117; color: #e6edf3; border: 1px solid #30363d; padding: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; margin: 16px 0; border-radius: 0px;"><code>$1</code></pre>')
      .replaceAll(/<code[^>]*>(.*?)<\/code>/gi, '<code style="background-color: #f0f0f0; color: #111111; padding: 2px 4px; font-family: ui-monospace, monospace; font-size: 12px; border: 1px solid #dedede;">$1</code>')
      // Style blockquotes
      .replaceAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '<blockquote style="border-left: 3px solid #111111; background-color: #f7f7f7; padding: 10px 14px; margin: 16px 0; font-family: ui-monospace, monospace; font-size: 13px; color: #444444;">$1</blockquote>')
      // Style lists
      .replaceAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '<ul style="font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.7; color: #333333; margin: 0 0 14px 0; padding-left: 20px;">$1</ul>')
      .replaceAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '<ol style="font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.7; color: #333333; margin: 0 0 14px 0; padding-left: 20px;">$1</ol>')
      .replaceAll(/<li[^>]*>(.*?)<\/li>/gi, '<li style="margin-bottom: 6px;">$1</li>')
      // Style links
      .replaceAll(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1" style="color: #111111; text-decoration: underline; font-weight: 600;">$2</a>')
  )
}

/**
 * Compiles a post into a sharp, monochromatic, brutalist HTML email
 */
export function compilePostToMonospaceEmail(
  post: EmailDispatchPost,
  options: EmailCompileOptions
): { subject: string; html: string; text: string } {
  const { siteUrl, unsubscribeUrl, issueNumber = post.id.slice(0, 6).toUpperCase() } = options

  const postUrl = `${siteUrl}/posts/${post.id}`
  const dateFormatted = post.createdAt.toISOString().split('T')[0]
  const tagsFormatted = (post.tags ?? []).map((t) => `#${t}`).join(' ')
  const formattedContent = sanitizeContentForEmail(post.content ?? '')

  const subject = `[DISPATCH #${issueNumber}] ${post.title}`

  const plainText = `
============================================================
[+] DEVOPS & AI ARCHITECTURE DISPATCH // ISSUE #${issueNumber}
============================================================
TITLE:   ${post.title}
DATE:    ${dateFormatted}
AUTHOR:  ${post.author.name}
TOPICS:  ${tagsFormatted || 'DevOps & Systems Engineering'}
LINK:    ${postUrl}
------------------------------------------------------------

${post.description ? `${post.description}\n\n------------------------------------------------------------\n` : ''}

Read the full interactive deep dive, runbooks, and diagrams online:
${postUrl}

------------------------------------------------------------
UNSUBSCRIBE:
To unsubscribe from future dispatches, visit:
${unsubscribeUrl}
============================================================
`.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f4f2ec; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #111111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #111111; border-collapse: collapse;">
    <!-- Top Telemetry Header -->
    <tr>
      <td style="padding: 12px 18px; border-bottom: 1px solid #111111; background-color: #ece8df; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" style="color: #111111;">
              [+] DEVOPS &amp; AI DISPATCH // ISSUE #${issueNumber}
            </td>
            <td align="right" style="color: #666666; font-size: 10px;">
              ${dateFormatted}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Title & Metadata Block -->
    <tr>
      <td style="padding: 24px 20px 16px 20px; border-bottom: 1px solid #e0ded6;">
        <h1 style="font-size: 22px; line-height: 1.3; font-weight: 700; margin: 0 0 12px 0; color: #000000; letter-spacing: -0.02em;">
          ${post.title}
        </h1>

        ${
          post.description
            ? `<div style="border-left: 3px solid #111111; padding-left: 12px; margin: 12px 0; font-size: 13px; line-height: 1.6; color: #555555;">
                ${post.description}
               </div>`
            : ''
        }

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 14px; font-size: 11px; color: #555555; border-top: 1px dashed #d5d3cb; padding-top: 10px;">
          <tr>
            <td style="padding: 2px 0;"><strong>AUTHOR:</strong> ${post.author.name}</td>
            <td align="right" style="padding: 2px 0;"><strong>FORMAT:</strong> MONOSPACE HTML</td>
          </tr>
          ${
            tagsFormatted
              ? `<tr>
                  <td colspan="2" style="padding: 2px 0; color: #666666;"><strong>TOPICS:</strong> ${tagsFormatted}</td>
                </tr>`
              : ''
          }
        </table>
      </td>
    </tr>

    <!-- Post Body Content -->
    <tr>
      <td style="padding: 24px 20px 20px 20px; font-size: 13px; line-height: 1.7; color: #222222;">
        ${formattedContent}

        <!-- Primary Call to Action Button (0px brutalist) -->
        <div style="margin: 32px 0 20px 0; text-align: center;">
          <a href="${postUrl}" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; font-family: ui-monospace, monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid #111111;">
            [ ↘ READ FULL DEEP DIVE &amp; LIVE BLUEPRINTS ]
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer & Unsubscribe Compliance Section -->
    <tr>
      <td style="padding: 16px 20px; background-color: #ece8df; border-top: 1px solid #111111; font-size: 11px; line-height: 1.6; color: #666666;">
        <div style="font-weight: 700; color: #111111; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
          // PUBLICATION SPECIFICATION &amp; PRIVACY
        </div>
        <p style="margin: 0 0 8px 0;">
          Sent to registered subscribers of the DevOps, Cloud &amp; AI Dispatch. Zero tracking pixels, cross-site beacons, or third-party ads.
        </p>
        <p style="margin: 0; font-size: 10px;">
          To stop receiving these technical briefs, click here to 
          <a href="${unsubscribeUrl}" style="color: #111111; text-decoration: underline; font-weight: 600;">1-click unsubscribe</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  return {
    subject,
    html,
    text: plainText
  }
}

export type DispatchResult = {
  success: boolean
  recipientCount: number
  simulated: boolean
  error?: string
  message: string
}

/**
 * Dispatches the compiled email to all active subscribers via Resend or Simulation fallback
 */
export async function sendNewsletterDispatch(
  post: EmailDispatchPost,
  subscriberEmails: string[],
  options: {
    siteUrl: string
    fromEmail?: string
  }
): Promise<DispatchResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = options.fromEmail ?? process.env.EMAIL_FROM ?? 'DevOps Dispatch <onboarding@resend.dev>'

  if (subscriberEmails.length === 0) {
    return {
      success: true,
      recipientCount: 0,
      simulated: false,
      message: 'No active subscribers found in the database.'
    }
  }

  // Simulation mode when RESEND_API_KEY is not configured
  if (!apiKey) {
    console.log(
      `[NEWSLETTER_DISPATCH:SIMULATION] Dispatched issue for post "${post.title}" (${post.id}) to ${subscriberEmails.length} subscribers.`
    )
    return {
      success: true,
      recipientCount: subscriberEmails.length,
      simulated: true,
      message: `Simulated dispatch to ${subscriberEmails.length} subscriber(s). To send live emails, configure RESEND_API_KEY in your environment.`
    }
  }

  try {
    const resend = new Resend(apiKey)

    // Resend batch sending allows up to 100 emails per batch
    const BATCH_SIZE = 50
    let deliveredCount = 0

    for (let i = 0; i < subscriberEmails.length; i += BATCH_SIZE) {
      const batch = subscriberEmails.slice(i, i + BATCH_SIZE)

      const emailPayloads = batch.map((email) => {
        const unsubscribeUrl = `${options.siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
        const compiled = compilePostToMonospaceEmail(post, {
          siteUrl: options.siteUrl,
          unsubscribeUrl
        })

        return {
          from,
          to: email,
          subject: compiled.subject,
          html: compiled.html,
          text: compiled.text
        }
      })

      const { data, error } = await resend.batch.send(emailPayloads)

      if (error) {
        console.error('[NEWSLETTER_DISPATCH:BATCH_ERROR]', error)
        throw new Error(`Resend batch error: ${error.message}`)
      }

      deliveredCount += data.data.length
    }

    return {
      success: true,
      recipientCount: deliveredCount,
      simulated: false,
      message: `Successfully dispatched to ${deliveredCount} subscriber(s) via Resend.`
    }
  } catch (error) {
    console.error('[NEWSLETTER_DISPATCH:ERROR]', error)
    return {
      success: false,
      recipientCount: 0,
      simulated: false,
      error: error instanceof Error ? error.message : 'Unknown dispatch error',
      message: `Failed to dispatch newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
