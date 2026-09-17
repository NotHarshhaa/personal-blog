import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'DevOps, Cloud & AI Space'
  const description = searchParams.get('description') ?? ''
  const tagsParam = searchParams.get('tags')
  const tags = tagsParam
    ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
    : ['DevOps', 'Cloud', 'AI Platform']

  let titleFontSize = '56px'
  if (title.length > 65) {
    titleFontSize = '40px'
  } else if (title.length > 38) {
    titleFontSize = '48px'
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#07090e',
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          padding: '36px',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#ffffff'
        }}
      >
        {/* Subtle Ambient Radial Glows */}
        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            width: '600px',
            height: '400px',
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.12) 0%, transparent 70%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '0px',
            width: '500px',
            height: '350px',
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.09) 0%, transparent 70%)'
          }}
        />

        {/* Blueprint Main Frame */}
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            backgroundColor: 'rgba(12, 16, 25, 0.94)'
          }}
        >
          {/* Signature Blueprint Corner Brackets */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid rgba(255, 255, 255, 0.65)',
              borderLeft: '3px solid rgba(255, 255, 255, 0.65)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid rgba(255, 255, 255, 0.65)',
              borderRight: '3px solid rgba(255, 255, 255, 0.65)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid rgba(255, 255, 255, 0.65)',
              borderLeft: '3px solid rgba(255, 255, 255, 0.65)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid rgba(255, 255, 255, 0.65)',
              borderRight: '3px solid rgba(255, 255, 255, 0.65)'
            }}
          />

          {/* Blueprint Frame Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '16px 32px'
            }}
          >
            {/* Live Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                  color: '#e2e8f0',
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
                color: '#64748b',
                letterSpacing: '0.14em'
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
              padding: '24px 40px'
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
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      padding: '5px 12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#cbd5e1'
                    }}
                  >
                    <span style={{ color: '#38bdf8' }}>#</span>
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Article Title */}
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.035em',
                color: '#ffffff',
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
                  fontSize: '20px',
                  lineHeight: 1.45,
                  color: '#94a3b8',
                  marginTop: '16px',
                  maxHeight: '64px',
                  overflow: 'hidden',
                  fontWeight: 400
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
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '16px 32px'
            }}
          >
            {/* Left: Author & Space Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#ffffff'
                }}
              >
                H
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.2
                  }}
                >
                  Harshhaa
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: '#64748b',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
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
                border: '1px solid rgba(255, 255, 255, 0.16)',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                padding: '8px 16px'
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#38bdf8'
                }}
              >
                &gt;_
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#f1f5f9',
                  letterSpacing: '0.04em',
                  fontWeight: 600
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
      height: 630
    }
  )
}
