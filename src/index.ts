import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from './config.js'
import { connectDB, disconnectDB } from './db.js'
import { corsMiddleware } from './middleware/cors.js'
import { errorHandler } from './middleware/error.js'
import auth from './routes/auth.js'
import guilds from './routes/guilds.js'
import settings from './routes/settings.js'
import modlog from './routes/modlog.js'
import commands from './routes/commands.js'
import leaderboard from './routes/leaderboard.js'
import pollsTickets from './routes/pollsTickets.js'

const app = new Hono()

app.use('*', corsMiddleware)
app.onError(errorHandler)

app.route('/auth', auth)
app.route('/api/guilds', guilds)
app.route('/api/guilds', settings)
app.route('/api/guilds', modlog)
app.route('/api/guilds', commands)
app.route('/api/guilds', pollsTickets)
app.route('/api/leaderboard', leaderboard)

app.get('/health', (c) => c.json({ ok: true }))

async function main() {
  await connectDB()
  serve({ fetch: app.fetch, port: config.port }, (info) => {
    console.log(`[API] Server running on http://localhost:${info.port}`)
  })
}

main().catch((err) => {
  console.error('[API] Failed to start:', err)
  process.exit(1)
})

process.on('SIGINT', async () => {
  await disconnectDB()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await disconnectDB()
  process.exit(0)
})
