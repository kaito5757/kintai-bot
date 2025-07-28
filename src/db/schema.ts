import { pgTable, varchar, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Slackユーザーテーブル
export const slackUsers = pgTable('slack_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  slackUserId: varchar('slack_user_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }),
  displayName: varchar('display_name', { length: 255 }),
  realName: varchar('real_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  teamId: varchar('team_id', { length: 255 }),
  isActive: varchar('is_active', { length: 10 }).default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Slackチャンネルテーブル
export const slackChannels = pgTable('slack_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  slackChannelId: varchar('slack_channel_id', { length: 255 }).notNull().unique(),
  channelName: varchar('channel_name', { length: 255 }),
  channelType: varchar('channel_type', { length: 50 }), // public, private, im, mpim
  isActive: varchar('is_active', { length: 10 }).default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 既存のログテーブル（履歴用として残す）
export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  slackUserId: varchar('slack_user_id', { length: 255 }).notNull(),
  slackChannelId: varchar('slack_channel_id', { length: 255 }), // チャンネル情報を追加
  action: varchar('action', { length: 50 }).notNull(), // 業務開始, 業務終了, 休憩開始, 休憩終了
  timestamp: timestamp('timestamp').notNull(),
  slackTimestamp: varchar('slack_timestamp', { length: 255 }).notNull(),
  rawMessage: text('raw_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ワークセッションテーブル（業務開始〜業務終了の単位）
export const workSessions = pgTable('work_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slackUserId: varchar('slack_user_id', { length: 255 }).notNull(), // 一旦文字列のまま保持
  slackChannelId: varchar('slack_channel_id', { length: 255 }), // チャンネル情報を追加
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 休憩テーブル
export const breaks = pgTable('breaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workSessionId: uuid('work_session_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// リレーション定義
export const slackUsersRelations = relations(slackUsers, ({ many }) => ({
  workSessions: many(workSessions),
  attendanceRecords: many(attendanceRecords),
}));

export const slackChannelsRelations = relations(slackChannels, ({ many }) => ({
  workSessions: many(workSessions),
  attendanceRecords: many(attendanceRecords),
}));

export const workSessionsRelations = relations(workSessions, ({ one, many }) => ({
  slackUser: one(slackUsers, {
    fields: [workSessions.slackUserId],
    references: [slackUsers.slackUserId], // 文字列のslackUserIdで関連付け
  }),
  slackChannel: one(slackChannels, {
    fields: [workSessions.slackChannelId],
    references: [slackChannels.slackChannelId], // チャンネル関連付け
  }),
  breaks: many(breaks),
}));

export const breaksRelations = relations(breaks, ({ one }) => ({
  workSession: one(workSessions, {
    fields: [breaks.workSessionId],
    references: [workSessions.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  slackUser: one(slackUsers, {
    fields: [attendanceRecords.slackUserId],
    references: [slackUsers.slackUserId], // 既存データとの互換性のためslackUserIdを使用
  }),
  slackChannel: one(slackChannels, {
    fields: [attendanceRecords.slackChannelId],
    references: [slackChannels.slackChannelId], // チャンネル関連付け
  }),
}));

// 型定義
export type SlackUser = typeof slackUsers.$inferSelect;
export type NewSlackUser = typeof slackUsers.$inferInsert;

export type SlackChannel = typeof slackChannels.$inferSelect;
export type NewSlackChannel = typeof slackChannels.$inferInsert;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;

export type WorkSession = typeof workSessions.$inferSelect;
export type NewWorkSession = typeof workSessions.$inferInsert;

export type Break = typeof breaks.$inferSelect;
export type NewBreak = typeof breaks.$inferInsert;