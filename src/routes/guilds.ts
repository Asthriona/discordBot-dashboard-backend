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

const INVITE_PERMISSIONS = (
  (1n << 1n) | // KickMembers
  (1n << 2n) | // BanMembers
  (1n << 4n) | // ManageChannels
  (1n << 5n) | // ManageGuild
  (1n << 6n) | // AddReactions
  (1n << 7n) | // ViewAuditLog
  (1n << 10n) | // ViewChannel
  (1n << 11n) | // SendMessages
  (1n << 13n) | // ManageMessages
  (1n << 14n) | // EmbedLinks
  (1n << 15n) | // AttachFiles
  (1n << 16n) | // ReadMessageHistory
  (1n << 20n) | // Connect
  (1n << 21n) | // Speak
  (1n << 28n) | // ManageRoles
  (1n << 29n) | // ManageWebhooks
  (1n << 40n) // ModerateMembers
).toString()

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
    .map((g) => ({
      ...g,
      hasBot: botGuilds.has(g.id),
      inviteUrl: `https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&permissions=${INVITE_PERMISSIONS}&scope=bot&guild_id=${g.id}`,
    }))
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
