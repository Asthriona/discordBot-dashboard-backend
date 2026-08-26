function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback
}

function optionalInt(name: string, fallback: number): number {
  const v = process.env[name]
  return v ? parseInt(v, 10) : fallback
}

function intList(name: string, fallback: number[]): number[] {
  const v = process.env[name]
  if (!v) return fallback
  return v.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
}

export const config = Object.freeze({
  env: optional('NODE_ENV', 'development'),
  jwtSecret: required('JWT_SECRET'),
  discord: {
    clientId: required('DISCORD_CLIENT_ID'),
    clientSecret: required('DISCORD_CLIENT_SECRET'),
    redirectUri: required('DISCORD_REDIRECT_URI'),
  },
  mongo: {
    uri: required('MONGO_URI'),
    dbName: optional('MONGO_DB_NAME', 'discord_bot'),
  },
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
  port: optionalInt('PORT', 3000),
  botToken: required('BOT_TOKEN'),
})
