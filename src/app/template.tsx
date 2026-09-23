import type { ReactNode } from 'react'

/** Re-mounts on every route navigation, giving pages a soft blueprint fade-in. */
const Template = ({ children }: { children: ReactNode }) => {
  return <div className="animate-page-in">{children}</div>
}

export default Template
