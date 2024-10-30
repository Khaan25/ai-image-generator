import { Ratelimit } from '@unkey/ratelimit'

if (!process.env.UNKEY_API_KEY) {
  throw new Error('UNKEY_API_KEY is not set')
}

export const unkey = new Ratelimit({
  rootKey: process.env.UNKEY_API_KEY,
  namespace: 'image.generator',
  limit: 2,
  duration: '30m',
  async: true,
})
