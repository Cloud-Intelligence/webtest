import type { Context, Next } from 'hono';
import { sendAbuseAlert } from './discord';

const RATE_LIMIT = 3;
const WINDOW_SECONDS = 60;
const ALERT_COOLDOWN_TTL = 60 * 5; 

type Bindings = {
  ci_api_storage: KVNamespace;
  DISCORD_WEBHOOK_ALERT: string;
};

export const rateLimitMiddleware = () => {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    try {
      const ip = c.req.header('cf-connecting-ip') || 'unknown';
      const kv = c.env.ci_api_storage;

      const shortKey = `ratelimit:${ip}`;
      const alertCooldownKey = `alert_cooldown:${ip}`;

      const currentCount = parseInt((await kv.get(shortKey)) || '0');
      const newCount = currentCount + 1;

      await kv.put(shortKey, newCount.toString(), {
        expirationTtl: WINDOW_SECONDS,
      });

      const cooldown = await kv.get(alertCooldownKey);

      if (newCount > RATE_LIMIT && !cooldown) {
        await sendAbuseAlert(ip, c.env.DISCORD_WEBHOOK_ALERT);
        await kv.put(alertCooldownKey, '1', { expirationTtl: ALERT_COOLDOWN_TTL });
      }

      if (newCount > RATE_LIMIT) {
        return c.json(
          { error: 'Too many requests, please wait a minute before retrying.' },
          429
        );
      }

      await next();
    } catch (e) {
      console.error('Rate limiter error:', e);
      await next();
    }
  };
};

const blacklist = new Set<string>([]); // add blacklisted IPs here

export const blacklistMiddleware = () => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';

    if (blacklist.has(ip)) {
      return c.json({ error: 'Access denied: Your IP is blacklisted.' }, 403);
    }

    await next();
  };
};
