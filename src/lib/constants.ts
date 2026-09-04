import { env } from '@/env'

export const SITE_URL =
  env.NODE_ENV === 'production' ? 'https://blog.harshhaareddy.com' : 'http://localhost:3000'

export const SITE_NAME = 'DevOps, Cloud & AI Space'
export const SITE_TITLE = 'DevOps, Cloud & AI Space'
export const SITE_DESCRIPTION =
  'Welcome to Harshhaa DevOps, Cloud & AI Space — tutorials and notes on DevOps, cloud computing, platform engineering, AI/ML, MLOps, LLMOps, GenAI, and AI infrastructure. Hands-on write-ups on Kubernetes, Terraform, Docker, AWS, and the systems that run modern AI.'

export const SITE_TOPICS = [
  'DevOps',
  'Cloud',
  'Platform Engineering',
  'AI / ML',
  'MLOps',
  'LLMOps',
  'GenAI',
  'AI Infrastructure'
] as const

export const SITE_KEYWORDS = [
  'blog',
  'devops',
  'cloud computing',
  'platform engineering',
  'artificial intelligence',
  'machine learning',
  'mlops',
  'llmops',
  'genai',
  'generative ai',
  'ai infrastructure',
  'kubernetes',
  'terraform',
  'docker',
  'aws',
  'azure',
  'infrastructure',
  'automation',
  'ci/cd',
  'nextjs blog',
  'tech blog'
]
