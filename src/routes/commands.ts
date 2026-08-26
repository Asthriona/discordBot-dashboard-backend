import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth.js'
import { CustomCommand } from '../models/CustomCommand.js'
import { AppEnv } from '../types.js'

const commands = new Hono<AppEnv>()
commands.use('*', authMiddleware)

commands.get('/:id/commands', async (c) => {
  const guildId = c.req.param('id')
  const cmds = await CustomCommand.find({ guildId }).sort({ name: 1 }).lean()
  return c.json({ commands: cmds })
})

commands.post('/:id/commands', async (c) => {
  const guildId = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json()
  if (!body.name || !body.content) {
    return c.json({ error: 'Name and content required' }, 400)
  }
  const cmd = await CustomCommand.create({
    guildId,
    name: body.name.toLowerCase(),
    aliases: body.aliases || [],
    content: body.content,
    createdBy: user.userId,
  })
  return c.json({ command: cmd })
})

commands.patch('/:id/commands/:cmdId', async (c) => {
  const { id: guildId, cmdId } = c.req.param()
  const body = await c.req.json()
  const update: any = {}
  if (body.name) update.name = body.name.toLowerCase()
  if (body.aliases) update.aliases = body.aliases
  if (body.content) update.content = body.content

  const cmd = await CustomCommand.findOneAndUpdate(
    { _id: cmdId, guildId },
    { $set: update },
    { new: true },
  ).lean()
  if (!cmd) return c.json({ error: 'Command not found' }, 404)
  return c.json({ command: cmd })
})

commands.delete('/:id/commands/:cmdId', async (c) => {
  const { id: guildId, cmdId } = c.req.param()
  await CustomCommand.findOneAndDelete({ _id: cmdId, guildId })
  return c.json({ ok: true })
})

export default commands
