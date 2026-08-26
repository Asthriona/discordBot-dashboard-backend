import mongoose from 'mongoose'

const punishmentSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  targetId: { type: String, required: true },
  type: { type: String, required: true, enum: ['unban', 'unmute'] },
  executeAt: { type: Date, required: true, index: true },
  reason: { type: String, default: '' },
  executed: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

punishmentSchema.index({ executeAt: 1, executed: 1 })

export const Punishment = mongoose.model('Punishment', punishmentSchema, 'punishments')
