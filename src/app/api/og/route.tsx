import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const fontBoldResponse = await fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/instrument-sans@latest/latin-700-normal.ttf'
)
const fontBold = await fontBoldResponse.arrayBuffer()

const fontSemiBoldResponse = await fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/instrument-sans@latest/latin-600-normal.ttf'
)
const fontSemiBold = await fontSemiBoldResponse.arrayBuffer()

export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'DevOps, Cloud & AI Space'
  const description = searchParams.get('description') ?? ''
  const tagsParam = searchParams.get('tags')
  const isDark = searchParams.get('theme') === 'dark'

  const tags = tagsParam
    ? tagsParam
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    : ['DevOps', 'Cloud', 'AI Platform']

  let titleFontSize = '58px'
  if (title.length > 65) {
    titleFontSize = '44px'
  } else if (title.length > 38) {
    titleFontSize = '50px'
  }

  // Light Mode (Default) vs Dark Mode Colors
  const colors = isDark
    ? {
      outerBg: '#07090e',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      cardBg: 'rgba(12, 16, 25, 0.96)',
      cardBorder: 'rgba(255, 255, 255, 0.16)',
      bracketColor: '#ffffff',
      headerBg: 'rgba(255, 255, 255, 0.02)',
      headerBorder: 'rgba(255, 255, 255, 0.1)',
      badgeBg: 'rgba(255, 255, 255, 0.05)',
      badgeBorder: 'rgba(255, 255, 255, 0.2)',
      badgeText: '#e2e8f0',
      specColor: '#64748b',
      tagBg: 'rgba(255, 255, 255, 0.04)',
      tagBorder: 'rgba(255, 255, 255, 0.16)',
      tagHash: '#38bdf8',
      tagText: '#cbd5e1',
      titleColor: '#ffffff',
      descColor: '#94a3b8',
      footerBg: 'rgba(255, 255, 255, 0.02)',
      footerBorder: 'rgba(255, 255, 255, 0.1)',
      authorBoxBg: 'rgba(255, 255, 255, 0.08)',
      authorBoxBorder: 'rgba(255, 255, 255, 0.28)',
      authorBoxText: '#ffffff',
      authorName: '#f8fafc',
      authorSubtitle: '#64748b',
      domainBg: 'rgba(0, 0, 0, 0.45)',
      domainBorder: 'rgba(255, 255, 255, 0.16)',
      domainPrompt: '#38bdf8',
      domainText: '#f1f5f9'
    }
    : {
      // Architectural Blueprint Light Mode (Site UI)
      outerBg: '#f1f5f9',
      gridColor: 'rgba(15, 23, 42, 0.07)',
      cardBg: '#ffffff',
      cardBorder: '#cbd5e1',
      bracketColor: '#0f172a',
      headerBg: '#f8fafc',
      headerBorder: '#e2e8f0',
      badgeBg: '#ffffff',
      badgeBorder: '#cbd5e1',
      badgeText: '#0f172a',
      specColor: '#64748b',
      tagBg: '#f8fafc',
      tagBorder: '#e2e8f0',
      tagHash: '#0284c7',
      tagText: '#334155',
      titleColor: '#0f172a',
      descColor: '#475569',
      footerBg: '#f8fafc',
      footerBorder: '#e2e8f0',
      authorBoxBg: '#0f172a',
      authorBoxBorder: '#0f172a',
      authorBoxText: '#ffffff',
      authorName: '#0f172a',
      authorSubtitle: '#64748b',
      domainBg: '#ffffff',
      domainBorder: '#cbd5e1',
      domainPrompt: '#0284c7',
      domainText: '#0f172a'
    }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.outerBg,
          backgroundImage: `linear-gradient(to right, ${colors.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${colors.gridColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          padding: '32px',
          position: 'relative',
          fontFamily: '"Instrument Sans", sans-serif'
        }}
      >
        {/* Blueprint Main Frame */}
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${colors.cardBorder}`,
            backgroundColor: colors.cardBg,
            boxShadow: isDark
              ? 'none'
              : '0 4px 20px -2px rgba(15, 23, 42, 0.08)'
          }}
        >
          {/* Signature Blueprint Corner Brackets */}
          <div
            style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: '26px',
              height: '26px',
              borderTop: `4px solid ${colors.bracketColor}`,
              borderLeft: `4px solid ${colors.bracketColor}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '26px',
              height: '26px',
              borderTop: `4px solid ${colors.bracketColor}`,
              borderRight: `4px solid ${colors.bracketColor}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-3px',
              left: '-3px',
              width: '26px',
              height: '26px',
              borderBottom: `4px solid ${colors.bracketColor}`,
              borderLeft: `4px solid ${colors.bracketColor}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '26px',
              height: '26px',
              borderBottom: `4px solid ${colors.bracketColor}`,
              borderRight: `4px solid ${colors.bracketColor}`
            }}
          />

          {/* Blueprint Frame Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: `1px solid ${colors.headerBorder}`,
              backgroundColor: colors.headerBg,
              padding: '16px 36px'
            }}
          >
            {/* Live Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: `1px solid ${colors.badgeBorder}`,
                backgroundColor: colors.badgeBg,
                padding: '6px 14px'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: colors.badgeText,
                  fontWeight: 700
                }}
              >
                ARTICLE // DEVOPS · CLOUD · AI
              </span>
            </div>

            {/* Spec Tag */}
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: colors.specColor,
                letterSpacing: '0.14em',
                fontWeight: 600
              }}
            >
              [ SYS: VERIFIED ] // SPEC: 1200×630
            </div>
          </div>

          {/* Center Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              padding: '28px 44px'
            }}
          >
            {/* Topic Tags */}
            {tags.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px'
                }}
              >
                {tags.slice(0, 4).map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: `1px solid ${colors.tagBorder}`,
                      backgroundColor: colors.tagBg,
                      padding: '5px 12px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: colors.tagText
                    }}
                  >
                    <span style={{ color: colors.tagHash }}>#</span>
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Article Title */}
            <div
              style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: titleFontSize,
                fontWeight: 700,
                lineHeight: 1.14,
                letterSpacing: '-0.025em',
                color: colors.titleColor,
                maxHeight: '190px',
                overflow: 'hidden'
              }}
            >
              {title}
            </div>

            {/* Article Description */}
            {description ? (
              <div
                style={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '21px',
                  lineHeight: 1.45,
                  color: colors.descColor,
                  marginTop: '16px',
                  maxHeight: '64px',
                  overflow: 'hidden',
                  fontWeight: 600
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {/* Blueprint Frame Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: `1px solid ${colors.footerBorder}`,
              backgroundColor: colors.footerBg,
              padding: '16px 36px'
            }}
          >
            {/* Left: Author & Space Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: `1.5px solid ${colors.authorBoxBorder}`,
                  backgroundColor: colors.authorBoxBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: colors.authorBoxText
                }}
              >
                H
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <span
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: colors.authorName,
                    lineHeight: 1.2
                  }}
                >
                  Harshhaa
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: colors.authorSubtitle,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                >
                  DevOps, Cloud & AI Space
                </span>
              </div>
            </div>

            {/* Right: Terminal Prompt Domain Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: `1.5px solid ${colors.domainBorder}`,
                backgroundColor: colors.domainBg,
                padding: '8px 18px'
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: colors.domainPrompt
                }}
              >
                &gt;_
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: colors.domainText,
                  letterSpacing: '0.04em',
                  fontWeight: 700
                }}
              >
                blog.harshhaareddy.com
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Instrument Sans',
          data: fontSemiBold,
          weight: 600,
          style: 'normal'
        },
        {
          name: 'Instrument Sans',
          data: fontBold,
          weight: 700,
          style: 'normal'
        }
      ]
    }
  )
}
