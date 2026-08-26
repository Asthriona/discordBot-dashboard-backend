import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface JWTPayload {
  userId: string
  username: string
  discriminator: string
  avatar: string | null
  accessToken: string
}

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header('cookie')?.match(/token=([^;]+)/)?.[1]
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
