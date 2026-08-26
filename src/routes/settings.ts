import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import { GuildSettings } from '../models/GuildSettings.js'
import { AppEnv } from '../types.js'

const settings = new Hono<AppEnv>()
settings.use('*', authMiddleware)

settings.get('/:id/settings', async (c) => {
  const guildId = c.req.param('id')
  let doc = await GuildSettings.findOne({ guildId }).lean()
  if (!doc) {
    doc = await GuildSettings.create({ guildId }) as any
  }
  return c.json({ settings: doc })
})

settings.patch('/:id/settings', async (c) => {
  const guildId = c.req.param('id')
  const body = await c.req.json()
  const { settings: patch } = body
  if (!patch) return c.json({ error: 'Missing settings' }, 400)

  delete patch._id
  delete patch.guildId
  delete patch.createdAt
  delete patch.updatedAt

  const doc = await GuildSettings.findOneAndUpdate(
    { guildId },
    { $set: patch },
    { new: true, upsert: true },
  ).lean()
  return c.json({ settings: doc })
})

export default settings
