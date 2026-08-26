import mongoose from 'mongoose'

const warningSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  moderatorId: { type: String, required: true },
  action: { type: String, default: 'warning', enum: ['warning', 'mute', 'kick', 'ban'] },
  reason: { type: String, default: 'No reason provided', maxlength: 1000 },
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })

warningSchema.index({ guildId: 1, userId: 1, active: 1 })

export const Warning = mongoose.model('Warning', warningSchema, 'warnings')
