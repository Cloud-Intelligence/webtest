/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { rateLimitMiddleware,blacklistMiddleware } from './middleware'

type Bindings = {
  DISCORD_WEBHOOK_URL: string
  DISCORD_WEBHOOK_ALERT: string
  ALLOWED_ORIGINS?: string
  ci_api_storage: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: (origin, c) => c.env?.ALLOWED_ORIGIN ,
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}))

app.use('/book-call', blacklistMiddleware(), rateLimitMiddleware())
app.use('/contact', blacklistMiddleware(), rateLimitMiddleware())

const escapeDiscordMarkdown = (text: string): string => {
  return text.replace(/[\\`*_{}[\]()~>#+=|.!-]/g, '\\$&')
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateBookCall = (data: any) => {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }
  
  if (!data.contact || typeof data.contact !== 'string' || data.contact.trim().length < 5) {
    errors.push('Contact must be at least 5 characters')
  }
  
  if (data.contact && data.contact.includes('@') && !emailRegex.test(data.contact.trim())) {
    errors.push('Please provide a valid email address')
  }
  
  if (data.company && typeof data.company !== 'string') {
    errors.push('Company must be a string')
  }
  
  if (data.message && typeof data.message !== 'string') {
    errors.push('Message must be a string')
  }
  
  const serialized = {
    name: escapeDiscordMarkdown(data.name?.toString().trim().slice(0, 100) || ''),
    contact: escapeDiscordMarkdown(data.contact?.toString().trim().slice(0, 100) || ''),
    company: data.company ? escapeDiscordMarkdown(data.company.toString().trim().slice(0, 100)) : undefined,
    projectType: data.projectType ? escapeDiscordMarkdown(data.projectType.toString().trim().slice(0, 50)) : undefined,
    timeframe: data.timeframe ? escapeDiscordMarkdown(data.timeframe.toString().trim().slice(0, 50)) : undefined,
    budget: data.budget ? escapeDiscordMarkdown(data.budget.toString().trim().slice(0, 50)) : undefined,
    message: data.message ? escapeDiscordMarkdown(data.message.toString().trim().slice(0, 1000)) : undefined,
  }
  
  return { errors, data: serialized }
}

const validateContact = (data: any) => {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }
  
  if (!data.contact || typeof data.contact !== 'string' || data.contact.trim().length < 5) {
    errors.push('Contact must be at least 5 characters')
  }
  
  if (data.contact && data.contact.includes('@') && !emailRegex.test(data.contact.trim())) {
    errors.push('Please provide a valid email address')
  }
  
  if (data.message && typeof data.message !== 'string') {
    errors.push('Message must be a string')
  }
  
  const serialized = {
    name: escapeDiscordMarkdown(data.name?.toString().trim().slice(0, 100) || ''),
    contact: escapeDiscordMarkdown(data.contact?.toString().trim().slice(0, 100) || ''),
    message: data.message ? escapeDiscordMarkdown(data.message.toString().trim().slice(0, 1000)) : undefined,
  }
  
  return { errors, data: serialized }
}

const logRequest = async (c: Context<{ Bindings: Bindings }>, endpoint: string, data: any) => {
  try {
    const ip = c.req.header('cf-connecting-ip') || 'unknown'
    const timestamp = new Date().toISOString()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const key = `log:${endpoint}:${Date.now()}-${randomSuffix}`

    const logEntry = {
      timestamp,
      ip,
      endpoint,
      data,
    }

    await c.env.ci_api_storage.put(key, JSON.stringify(logEntry), { expirationTtl: 60 * 60 * 24 * 7 }) // Keep logs 7 days
  } catch (e) {
  }
}

app.post('/book-call', async (c) => {
  try {
    const rawData = await c.req.json()
    const { errors, data } = validateBookCall(rawData)
    
    if (errors.length > 0) {
      return c.json({ error: errors.join(', ') }, 400)
    }

     await logRequest(c, 'book-call', data)

    if (!c.env.DISCORD_WEBHOOK_URL) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "New consultation request!",
        embeds: [embed]
      })
    })

    if (!response.ok) {
      return c.json({ error: 'Failed to send message' }, 500)
    }

    return c.json({ 
      success: true, 
      message: 'Thank you! Your request has been submitted successfully.' 
    })
    
  } catch (error) {
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

app.post('/contact', async (c) => {
  try {
    const rawData = await c.req.json()
    const { errors, data } = validateContact(rawData)

    if (errors.length > 0) {
      return c.json({ error: errors.join(', ') }, 400)
    }

    await logRequest(c, 'contact', data)

    if (!c.env.DISCORD_WEBHOOK_URL) {
      return c.json({ error: 'Server configuration error' }, 500)
    }

    const embed = {
      title: "New Contact Message",
      color: 0x3b82f6, // Same color as book-call
      fields: [
        { name: "Name", value: data.name, inline: true },
        { name: "Contact", value: data.contact, inline: true },
        { name: "Type", value: "General Inquiry", inline: true },
      ],
      timestamp: new Date().toISOString(),
    }

    if (data.message) {
      embed.fields.push({
        name: "Message",
        value: data.message.length > 1000 ? data.message.substring(0, 1000) + "..." : data.message,
        inline: false
      })
    }

    const response = await fetch(c.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "New contact form submission!",
        embeds: [embed]
      })
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', await response.text())
      return c.json({ error: 'Failed to send message to Discord' }, 500)
    }

    return c.json({
      success: true,
      message: 'Thank you! We have received your message and will respond soon.'
    })

  } catch (error) {
    console.error('Contact endpoint error:', error)
    return c.json({ error: 'Invalid request data' }, 400)
  }
})

export default app
