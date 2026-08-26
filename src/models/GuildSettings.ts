import mongoose from 'mongoose'

const reactionRoleSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  emoji: { type: String, required: true },
  emojiId: { type: String, default: null },
  roleId: { type: String, required: true },
}, { _id: false })

const selfRoleSchema = new mongoose.Schema({
  roleId: { type: String, required: true },
  label: { type: String, default: '' },
  emoji: { type: String, default: '' },
}, { _id: false })

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  modlogChannelId: { type: String, default: null },
  mutedRoleId: { type: String, default: null },
  automod: {
    enabled: { type: Boolean, default: true },
    keywords: { type: [String], default: [] },
    maxMentions: { type: Number, default: 5 },
    blockedInvites: { type: Boolean, default: true },
    spamThreshold: { type: Number, default: 6 },
    spamWindowMs: { type: Number, default: 8000 },
    action: { type: String, default: 'delete', enum: ['delete', 'warn', 'mute', 'kick'] },
  },
  roles: {
    autoRoleId: { type: String, default: null },
    reactionRoles: { type: [reactionRoleSchema], default: [] },
    selfAssignRoles: { type: [selfRoleSchema], default: [] },
    selfAssignMenuMessageId: { type: String, default: null },
    selfAssignMenuChannelId: { type: String, default: null },
  },
  logging: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    memberEvents: { type: Boolean, default: true },
    messageEvents: { type: Boolean, default: true },
    voiceEvents: { type: Boolean, default: true },
  },
  tickets: {
    enabled: { type: Boolean, default: false },
    categoryId: { type: String, default: null },
    supportRoleId: { type: String, default: null },
    transcriptChannelId: { type: String, default: null },
    panelChannelId: { type: String, default: null },
    panelMessageId: { type: String, default: null },
  },
  welcome: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    joinMessage: { type: String, default: 'Welcome {user} to {guild}!' },
    leaveMessage: { type: String, default: '{user} has left {guild}.' },
  },
  leveling: {
    enabled: { type: Boolean, default: true },
    xpPerMessage: { type: Number, default: 15 },
    xpCooldownSeconds: { type: Number, default: 60 },
    levelUpChannelId: { type: String, default: null },
  },
  pollChannelId: { type: String, default: null },
}, { timestamps: true, versionKey: false, minimize: false })

export const GuildSettings = mongoose.model('GuildSettings', guildSchema, 'guildsettings')
