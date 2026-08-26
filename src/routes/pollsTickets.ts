import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import { Poll } from '../models/Poll.js'
import { Ticket } from '../models/Ticket.js'
import { AppEnv } from '../types.js'

const pollsTickets = new Hono<AppEnv>()
pollsTickets.use('*', authMiddleware)

pollsTickets.get('/:id/polls-tickets', async (c) => {
  const guildId = c.req.param('id')
  const [polls, tickets] = await Promise.all([
    Poll.find({ guildId }).sort({ createdAt: -1 }).limit(50).lean(),
    Ticket.find({ guildId }).sort({ createdAt: -1 }).limit(50).lean(),
  ])
  return c.json({ polls, tickets })
})

export default pollsTickets
