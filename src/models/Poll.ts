import mongoose from 'mongoose'

const pollSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  question: { type: String, required: true, maxlength: 256 },
  creatorId: { type: String, required: true },
  options: [{
    label: { type: String, required: true, maxlength: 100 },
    votes: { type: [String], default: [] },
  }],
  open: { type: Boolean, default: true },
  endsAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false })

export const Poll = mongoose.model('Poll', pollSchema, 'polls')
