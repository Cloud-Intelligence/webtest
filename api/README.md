# CI API Backend Worker

## Setup and Deployment Instructions

### 1. Install Wrangler CLI globally

```bash
npm install -g wrangler
```

### 2. Install dependencies

```bash
npm install
```

### 3. connect to cloudflare npx wrangler login can verify your account with npx wrangler whoami


### 4. Set environment secret (Discord webhook URL)

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

## Notes

- The Worker source code is in `src/index.ts`.
- Environment secrets like `DISCORD_WEBHOOK_URL` are injected securely during runtime.
- Ensure `wrangler.toml` contains your Cloudflare account ID and main script path.
