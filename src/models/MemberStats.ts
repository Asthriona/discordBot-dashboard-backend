import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  lastXpAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false })

memberSchema.index({ guildId: 1, userId: 1 }, { unique: true })
memberSchema.index({ guildId: 1, xp: -1 })

export const MemberStats = mongoose.model('MemberStats', memberSchema, 'memberstats')
