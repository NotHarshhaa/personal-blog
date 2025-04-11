import { env } from '@/env'

export const SITE_URL =
  env.NODE_ENV === 'production' ? 'https://blog.notharshhaa.site' : 'http://localhost:3000'

export const SITE_NAME = 'DevOps & Cloud Space'
export const SITE_TITLE = 'DevOps & Cloud Space'
export const SITE_DESCRIPTION =
  'Welcome to Harshhaa DevOps & Cloud Space – a personal space dedicated to DevOps, Cloud computing, and all things infrastructure. Discover hands-on tutorials, practical engineering tips, and insights into tools like Kubernetes, Terraform, Docker, and AWS. Whether you are automating deployments or scaling systems, this is your go-to spot for real-world tech content.'
