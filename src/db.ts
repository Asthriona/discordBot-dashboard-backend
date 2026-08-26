import mongoose from 'mongoose'
import { config } from './config.js'

export async function connectDB() {
  await mongoose.connect(config.mongo.uri, { dbName: config.mongo.dbName })
  console.log('[DB] Connected to MongoDB')
}

export async function disconnectDB() {
  await mongoose.disconnect()
  console.log('[DB] Disconnected from MongoDB')
}
