import { Hono } from 'hono'
import { createCors } from './middleware'

type Bindings = {
  DISCORD_WEBHOOK_URL: string
  ALLOWED_ORIGINS?: string
}

const app = new Hono<{ Bindings: Bindings }>()


app.use('*', (c, next) => {
  const corsMiddleware = createCors(c.env)
  return corsMiddleware(c, next)
})


app.options('*', (c) => {
  return new Response(null, { status: 204 })
})


app.get('/health', (c) => c.json({ status: 'ok' }))

app.post('/book-call', async (c) => {
  try {
    const data = await c.req.json()
    
    if (!data.name || !data.contact) {
      return c.json({ error: 'Name and contact required' }, 400)
    }

    if (!c.env.DISCORD_WEBHOOK_URL) {
      console.error('Discord webhook URL not configured')
      return c.json({ error: 'Server configuration error' }, 500)
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

    const response = await fetch(c.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Contact-Form-Bot'
      },
      body: JSON.stringify({
        content: "New consultation request!",
        embeds: [embed]
      })
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
      return c.json({ error: 'Failed to send message' }, 500)
    }

    return c.json({ 
      success: true, 
      message: 'Thank you! Your request has been submitted successfully.' 
    })
    
  } catch (error) {
    console.error('Error processing request:', error)
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

app.post('/contact', async (c) => {
  try {
    const data = await c.req.json()

    if (!data.name || !data.contact) {
      return c.json({ error: 'Name and contact required' }, 400)
    }

    if (!c.env.DISCORD_WEBHOOK_URL) {
      console.error('Discord webhook URL not configured')
      return c.json({ error: 'Server configuration error' }, 500)
    }

    const embed = {
      title: "New Contact Message",
      color: 0x10b981, 
      fields: [
        { name: "Name", value: data.name, inline: true },
        { name: "Contact", value: data.contact, inline: true },
      ],
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(c.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Contact-Form-Bot'
      },
      body: JSON.stringify({
        content: "New contact message!",
        embeds: [embed]
      })
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
      return c.json({ error: 'Failed to send message' }, 500)
    }

    return c.json({ 
      success: true, 
      message: 'Thank you! Your contact message has been submitted successfully.' 
    })

  } catch (error) {
    console.error('Error processing contact request:', error)
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

export default app
