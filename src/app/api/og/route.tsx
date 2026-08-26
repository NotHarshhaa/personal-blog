import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'DevOps, Cloud & AI Engineering'
  const description = searchParams.get('description') || ''

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0c0e12',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.07) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.04) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '48px',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff'
        }}
      >
        {/* Inner Blueprint Frame */}
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'rgba(17, 20, 27, 0.75)',
            padding: '44px 48px'
          }}
        >
          {/* Corner L-Brackets */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '3px solid #60a5fa',
              borderLeft: '3px solid #60a5fa'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '3px solid #60a5fa',
              borderRight: '3px solid #60a5fa'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '3px solid #60a5fa',
              borderLeft: '3px solid #60a5fa'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '3px solid #60a5fa',
              borderRight: '3px solid #60a5fa'
            }}
          />

          {/* Top Header Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 14px'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  fontWeight: 600
                }}
              >
                DEVOPS · CLOUD · AI PLATFORM
              </span>
            </div>

            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#64748b',
                letterSpacing: '0.1em'
              }}
            >
              ARTICLE // PUBLICATION
            </span>
          </div>

          {/* Center Main Content (Article Title & Description) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', marginBottom: 'auto' }}>
            <div
              style={{
                fontSize: title.length > 60 ? '44px' : title.length > 35 ? '52px' : '58px',
                fontWeight: 800,
                lineHeight: 1.18,
                letterSpacing: '-0.03em',
                color: '#f8fafc',
                maxHeight: '220px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </div>

            {description ? (
              <div
                style={{
                  fontSize: '22px',
                  lineHeight: 1.45,
                  color: '#94a3b8',
                  maxHeight: '68px',
                  overflow: 'hidden',
                  fontWeight: 400
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {/* Bottom Footer Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid #3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#60a5fa'
                }}
              >
                H
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0' }}>Harshhaa</span>
            </div>

            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '15px',
                color: '#94a3b8',
                letterSpacing: '0.08em',
                fontWeight: 500
              }}
            >
              blog.harshhaareddy.site
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
