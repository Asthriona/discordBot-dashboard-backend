import { Hono } from 'hono'
import { JWTPayload } from './middleware/auth.js'

export type AppEnv = {
  Variables: {
    user: JWTPayload
  }
}

export const app = new Hono<AppEnv>()
