import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  ownerId: { type: String, required: true, index: true },
  topic: { type: String, default: '' },
  status: { type: String, default: 'open', enum: ['open', 'closed'], index: true },
  transcript: { type: String, default: null },
  closedBy: { type: String, default: null },
  closedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false })

ticketSchema.index({ guildId: 1, status: 1 })

export const Ticket = mongoose.model('Ticket', ticketSchema, 'tickets')
