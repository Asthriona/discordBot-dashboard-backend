import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import { Warning } from '../models/Warning.js'
import { Punishment } from '../models/Punishment.js'
import { AppEnv } from '../types.js'

const modlog = new Hono<AppEnv>()
modlog.use('*', authMiddleware)

modlog.get('/:id/modlog', async (c) => {
  const guildId = c.req.param('id')
  const [warnings, punishments] = await Promise.all([
    Warning.find({ guildId }).sort({ createdAt: -1 }).limit(100).lean(),
    Punishment.find({ guildId }).sort({ createdAt: -1 }).limit(100).lean(),
  ])
  return c.json({ warnings, punishments })
})

export default modlog
