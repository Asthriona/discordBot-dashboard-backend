import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { authMiddleware, JWTPayload } from '../middleware/auth.js'
import { AppEnv } from '../types.js'

const auth = new Hono<AppEnv>()

auth.get('/discord', (c) => {
  const params = new URLSearchParams({
    client_id: config.discord.clientId,
    redirect_uri: config.discord.redirectUri,
    response_type: 'code',
    scope: 'identify%20guilds',
  })
  return c.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
})

auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.redirect(config.frontendUrl)

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.discord.redirectUri,
    }),
  })
  const tokenData = await tokenRes.json() as any
  if (!tokenData.access_token) return c.redirect(config.frontendUrl)

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const userData = await userRes.json() as any

  const jwtPayload: JWTPayload = {
    userId: userData.id,
    username: userData.username,
    discriminator: userData.discriminator,
    avatar: userData.avatar,
    accessToken: tokenData.access_token,
  }
  const token = jwt.sign(jwtPayload, config.jwtSecret, { expiresIn: '7d' })

  c.header('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`)
  return c.redirect(`${config.frontendUrl}/dashboard`)
})

auth.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ user: { id: user.userId, username: user.username, discriminator: user.discriminator, avatar: user.avatar } })
})

auth.get('/logout', (c) => {
  c.header('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0')
  return c.json({ ok: true })
})

export default auth
