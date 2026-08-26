import { Context } from 'hono'

export function errorHandler(err: Error, c: Context) {
  console.error('[ERROR]', err.message)
  return c.json({ error: 'Internal server error' }, 500)
}
