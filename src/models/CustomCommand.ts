import mongoose from 'mongoose'

const customCommandSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  name: { type: String, required: true, lowercase: true, maxlength: 32 },
  aliases: { type: [String], default: [], maxlength: 8 },
  content: { type: String, required: true, maxlength: 2000 },
  createdBy: { type: String, required: true },
  uses: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false })

customCommandSchema.index({ guildId: 1, name: 1 }, { unique: true })

export const CustomCommand = mongoose.model('CustomCommand', customCommandSchema, 'customcommands')
