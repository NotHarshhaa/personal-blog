import { getCurrentUser } from '@/lib/auth'

import ClientHeader from './client-header'

const Header = async () => {
  const user = await getCurrentUser()
  return <ClientHeader user={user} />
}

export default Header
