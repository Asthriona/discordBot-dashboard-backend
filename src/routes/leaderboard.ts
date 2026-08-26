import { Hono } from 'hono'
import { MemberStats } from '../models/MemberStats.js'

const leaderboard = new Hono()

leaderboard.get('/:guildId', async (c) => {
  const guildId = c.req.param('guildId')
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100)
  const entries = await MemberStats.find({ guildId })
    .sort({ xp: -1 })
    .limit(limit)
    .lean()
  return c.json({ leaderboard: entries.map((e) => ({ userId: e.userId, xp: e.xp, level: e.level })) })
})

leaderboard.get('/:guildId/:userId', async (c) => {
  const { guildId, userId } = c.req.param()
  const entry = await MemberStats.findOne({ guildId, userId }).lean()
  if (!entry) return c.json({ error: 'Not found' }, 404)
  const rank = await MemberStats.countDocuments({ guildId, xp: { $gt: entry.xp } }) + 1
  return c.json({ userId, xp: entry.xp, level: entry.level, rank })
})

export default leaderboard
