# CI API Backend Worker

## Setup and Deployment Instructions

### 1. Install Wrangler CLI globally

```bash
npm install -g wrangler
```

### 2. Install dependencies

```bash
npm install
npm install hono
```

### 3. Login to Cloudflare with Wrangler

```bash
npx wrangler login
```

Verify your login:

```bash
npx wrangler whoami
```

### 4. Set up KV Namespace and Secrets

Create KV namespace for production:

```bash
wrangler kv:namespace create "ci_api_storage"
```

Create KV namespace for preview/development:

```bash
wrangler kv:namespace create "ci_api_storage" --preview
```

Set your Discord webhook URL as a secret:

```bash
npx wrangler secret put DISCORD_WEBHOOK_URL
```

Enter your Discord webhook URL when prompted.

### 5. Run the Worker locally for development

```bash
npx wrangler dev
```

### 6. Deploy the Worker to Cloudflare

```bash
npx wrangler deploy
```

---

## Features

- **Rate limiting** per IP with short window (default 3 requests per minute).
- **Discord alerts** when abuse is detected (requests exceeding limit).
- **Blacklist middleware** for denying specific IPs.

---

## Configuration

- `DISCORD_WEBHOOK_URL` secret holds the Discord webhook URL for alerts.
- `ci_api_storage` is the KV namespace used for rate limiting counters.
- You can add IPs to the blacklist in `blacklistMiddleware` by updating the IP set.

---

## Source Files

- Main code: `src/index.ts`
- Discord alert helper: `src/discord.ts`
- Middleware for rate limiting and blacklist implemented in `src/index.ts`
