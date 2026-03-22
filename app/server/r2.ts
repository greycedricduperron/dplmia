import { getCloudflareEnv } from './env'

export function getR2Bucket(): R2Bucket {
  return getCloudflareEnv().R2_BUCKET
}

export function getR2PublicUrl(key: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${key}`
}
