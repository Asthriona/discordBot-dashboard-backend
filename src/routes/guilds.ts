import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth.js'
import { GuildSettings } from '../models/GuildSettings.js'
import { config } from '../config.js'
import { AppEnv } from '../types.js'

const guilds = new Hono<AppEnv>()
guilds.use('*', authMiddleware)

interface GuildInfo {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: number
}

async function fetchUserGuilds(accessToken: string): Promise<GuildInfo[]> {
  const res = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []
  return res.json() as Promise<GuildInfo[]>
}

async function fetchBotGuilds(): Promise<Set<string>> {
  const res = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bot ${config.botToken}` },
  })
  if (!res.ok) return new Set()
  const guilds = await res.json() as any[]
  return new Set(guilds.map((g: any) => g.id))
}

guilds.get('/', async (c) => {
  const user = c.get('user')
  const [userGuilds, botGuilds] = await Promise.all([
    fetchUserGuilds(user.accessToken),
    fetchBotGuilds(),
  ])
  const filtered = userGuilds
    .filter((g) => (BigInt(g.permissions) & 0x20n) === 0x20n || g.owner)
    .map((g) => ({ ...g, hasBot: botGuilds.has(g.id) }))
    .sort((a, b) => (b.hasBot ? 1 : 0) - (a.hasBot ? 1 : 0))
  return c.json({ guilds: filtered })
})

guilds.get('/:id', async (c) => {
  const guildId = c.req.param('id')
  const user = c.get('user')
  const botGuilds = await fetchBotGuilds()
  if (!botGuilds.has(guildId)) {
    return c.json({ error: 'Bot is not in this guild' }, 404)
  }
  const guilds = await fetchUserGuilds(user.accessToken)
  const guild = guilds.find((g) => g.id === guildId)
  if (!guild) {
    return c.json({ error: 'Access denied' }, 403)
  }
  const memberRes = await fetch(`https://discord.com/api/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${config.botToken}` },
  })
  const memberData = await memberRes.json() as any
  return c.json({
    guild: { ...guild, memberCount: memberData.approximate_member_count },
  })
})

export default guilds
