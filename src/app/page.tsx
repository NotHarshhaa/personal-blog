import { Suspense } from 'react'

import DispatchLog from '@/components/dispatch-log'
import DispatchTerminal from '@/components/dispatch-terminal'
import { Frame, FrameBody, StripHeader } from '@/components/frame'
import GithubActivity from '@/components/github-activity'
import HacktronHero from '@/components/hacktron-hero'
import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import SiteTelemetry from '@/components/site-telemetry'
import TechStack from '@/components/tech-stack'
import TrendingPosts from '@/components/trending-posts'
import { range } from '@/utils'

const HomePage = () => {
  return (
    <div className='relative z-10 w-full space-y-6 sm:space-y-8'>
      <HacktronHero />

      <Suspense
        fallback={
          <Frame>
            <StripHeader
              left={<span className='text-foreground font-semibold'>Live site telemetry</span>}
              right={<span>Calibrating...</span>}
            />
            <FrameBody className='text-muted-foreground py-8 text-center font-mono text-sm'>
              CALIBRATING TELEMETRY...
            </FrameBody>
          </Frame>
        }
      >
        <SiteTelemetry />
      </Suspense>

      <GithubActivity username='NotHarshhaa' />

      <Suspense
        fallback={
          <Frame>
            <StripHeader
              left={
                <span className='text-foreground font-semibold'>
                  Dispatch log // git log --oneline
                </span>
              }
              right={<span>Traversing history...</span>}
            />
            <FrameBody className='text-muted-foreground py-8 text-center font-mono text-sm'>
              git log: traversing commit history...
            </FrameBody>
          </Frame>
        }
      >
        <DispatchLog />
      </Suspense>

      <Suspense
        fallback={
          <Frame>
            <StripHeader
              left={
                <span className='text-foreground font-semibold'>Trending // Top this week</span>
              }
              right={<span>Loading...</span>}
            />
            <FrameBody className='text-muted-foreground py-8 text-center text-sm'>
              Loading trending posts...
            </FrameBody>
          </Frame>
        }
      >
        <TrendingPosts />
      </Suspense>

      <section aria-label='Posts' id='archive' className='scroll-mt-24'>
        <Suspense
          fallback={
            <Frame>
              <StripHeader
                left={
                  <span className='text-foreground font-semibold'>Latest technical write-ups</span>
                }
                right={<span>Loading...</span>}
              />
              <div className='divide-border divide-y'>
                {range(6).map((i) => (
                  <PostsPlaceholder key={i} />
                ))}
              </div>
            </Frame>
          }
        >
          <Posts />
        </Suspense>
      </section>

      <TechStack />

      <section aria-label='Interactive guest terminal' id='terminal' className='scroll-mt-24'>
        <Suspense
          fallback={
            <Frame>
              <StripHeader
                left={<span className='text-foreground font-semibold'>Guest shell // tty1</span>}
                right={<span>Booting...</span>}
              />
              <FrameBody className='text-muted-foreground py-8 text-center font-mono text-sm'>
                BOOTING GUEST SHELL...
              </FrameBody>
            </Frame>
          }
        >
          <DispatchTerminal />
        </Suspense>
      </section>
    </div>
  )
}

export default HomePage
