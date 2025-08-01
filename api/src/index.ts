import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DISCORD_WEBHOOK_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()


app.use('*', cors())


app.get('/health', (c) => c.json({ status: 'ok' }))


app.post('/book-call', async (c) => {
  const data = await c.req.json()


  if (!data.name || !data.contact) {
    return c.json({ error: 'Name and contact required' }, 400)
  }

  const embed = {
    title: "New Call Request",
    color: 0x3b82f6,
    fields: [
      { name: "Name", value: data.name, inline: true },
      { name: "Contact", value: data.contact, inline: true },
      { name: "Company", value: data.company || 'Not specified', inline: true },
      { name: "Project Type", value: data.projectType || 'Not specified', inline: true },
      { name: "Timeframe", value: data.timeframe || 'Not specified', inline: true },
      { name: "Budget", value: data.budget || 'Not specified', inline: true },
    ],
    timestamp: new Date().toISOString(),
  }

  if (data.message) {
    embed.fields.push({ name: "Details", value: data.message, inline: false })
  }

  const resp = await fetch(c.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: "New consultation request!",
      embeds: [embed]
    })
  })

  if (!resp.ok) {
    return c.json({ error: 'Failed to send' }, 500)
  }

  return c.json({ success: true, message: 'Form submitted!' })
})

export default app
