import { cors } from 'hono/cors'
import { config } from '../config.js'

const origins = config.frontendUrl.split(',').map((s) => s.trim())

export const corsMiddleware = cors({
  origin: (origin) => {
    if (origins.includes(origin) || origins.includes('*')) return origin
    return origins[0] || config.frontendUrl
  },
  credentials: true,
})
