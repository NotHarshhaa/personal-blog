import TerminalConsole from '@/components/terminal-console'
import { getPosts } from '@/queries/get-posts'

/** Server bridge: seeds the guest shell with the latest public dispatches. */
const DispatchTerminal = async () => {
  const { posts } = await getPosts()

  return (
    <TerminalConsole
      posts={posts.slice(0, 12).map((post) => ({
        id: post.id,
        title: post.title,
        tags: post.tags,
        createdAt: post.createdAt
      }))}
    />
  )
}

export default DispatchTerminal
