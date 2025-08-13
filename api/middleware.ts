// middleware.ts
import type { Context, Next } from 'hono'
import { sendAbuseAlert } from './discord'
import { rateLimiter } from 'hono-rate-limiter'
import { WorkersKVStore } from '@hono-rate-limiter/cloudflare'

type Bindings = {
  DISCORD_WEBHOOK_URL: string
  DISCORD_WEBHOOK_ALERT: string
  ALLOWED_ORIGINS?: string
  "cloud-intelligence-website-kv": KVNamespace
}

export const rateLimitMiddleware = () => {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const store = new WorkersKVStore({ namespace: c.env["cloud-intelligence-website-kv"] })
    const ip = c.req.header('cf-connecting-ip') || 'unknown'

    const limiter = rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      store,
      keyGenerator: () => `rate_limit:${ip}`,
      standardHeaders: 'draft-6',
    })

    const res = await limiter(c as any, next)

    if (res && 'status' in res && res.status === 429) {
      const cooldownKey = `alert_cooldown:${ip}`
      const now = Date.now()
      const ALERT_COOLDOWN_MS = 5 * 60 * 1000 

      const lastAlert = await c.env["cloud-intelligence-website-kv"].get(cooldownKey)

      if (!lastAlert || now - Number(lastAlert) > ALERT_COOLDOWN_MS) {
        await c.env["cloud-intelligence-website-kv"].put(cooldownKey, now.toString(), {
          expirationTtl: Math.ceil(ALERT_COOLDOWN_MS / 1000)
        })

        try {
          await sendAbuseAlert(ip, c.env.DISCORD_WEBHOOK_ALERT)
        } catch (error) {
          console.error('Failed to send abuse alert:', error)
        }
      }
    }

    return res
  }
}


const blacklist = new Set<string>([]); 

export const blacklistMiddleware = () => {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';

    if (blacklist.has(ip)) {
      console.log(`Blocked blacklisted IP: ${ip}`);
      return c.json({ error: 'Access denied: Your IP is blacklisted.' }, 403);
    }

    await next();
  };
};
