import { cors } from 'hono/cors'

export const createCors = (env: any) => {
  return cors({
    origin: env.ALLOWED_ORIGINS,
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400 
  })
}