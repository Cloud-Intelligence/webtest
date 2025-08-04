import type { Context, Next } from 'hono'

const RATE_LIMIT = 3
const WINDOW_SECONDS = 60

type Bindings = {
  ci_api_storage: KVNamespace
}

export const rateLimitMiddleware = () => {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    try {
      const ip = c.req.header('cf-connecting-ip') || 'unknown'
      const key = `ratelimit:${ip}`
      const kv = c.env.ci_api_storage

      if (!kv) {
        await next()
        return
      }

      const count = parseInt((await kv.get(key)) || '0')

      if (count >= RATE_LIMIT) {
        return c.json(
          { error: 'Too many requests, please wait a minute before retrying.' },
          429
        )
      }

      await kv.put(key, (count + 1).toString(), { expirationTtl: WINDOW_SECONDS })
      await next()
    } catch (error) {
      await next()
    }
  }
}
