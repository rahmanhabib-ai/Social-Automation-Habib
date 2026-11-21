import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the 'users' table (Mandatory for Firebase Auth + Cloud SQL integration)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('admin'),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// System configurations - persists all dashboard configs (sidebar, theme, automations, security, etc.)
// Prevents any data loss on browser hard-reset or storage clear
export const systemConfigs = pgTable('system_configs', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Omnichannel Live Conversations
export const omniConversations = pgTable('omni_conversations', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  customerName: text('customer_name').notNull(),
  customerHandle: text('customer_handle'),
  customerAvatar: text('customer_avatar'),
  lastMessage: text('last_message'),
  lastMessageTime: text('last_message_time'),
  unreadCount: integer('unread_count').default(0),
  autoPilotEnabled: boolean('auto_pilot_enabled').default(true),
  isHandover: boolean('is_handover').default(false),
  status: text('status').default('active'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Omnichannel Messages
export const omniMessages = pgTable('omni_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  sender: text('sender').notNull(),
  senderName: text('sender_name').notNull(),
  text: text('text').notNull(),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  timestamp: text('timestamp').notNull(),
  isAiGenerated: boolean('is_ai_generated').default(false),
  intent: text('intent'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Social Marketing Posts
export const socialPosts = pgTable('social_posts', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  platforms: text('platforms').notNull(),
  mediaUrls: text('media_urls'),
  status: text('status').notNull(),
  scheduledTime: text('scheduled_time'),
  publishedTime: text('published_time'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Social Automation Rules
export const socialRules = pgTable('social_rules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  platform: text('platform').notNull(),
  triggerKeywords: text('trigger_keywords').notNull(),
  actionType: text('action_type').notNull(),
  replyTemplate: text('reply_template').notNull(),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Social Canned Quick Responses
export const socialCannedResponses = pgTable('social_canned_responses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  shortcut: text('shortcut').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Social Execution Logs
export const socialExecutionLogs = pgTable('social_execution_logs', {
  id: text('id').primaryKey(),
  ruleId: text('rule_id'),
  ruleName: text('rule_name'),
  platform: text('platform').notNull(),
  authorName: text('author_name'),
  triggerComment: text('trigger_comment'),
  replySent: text('reply_sent'),
  status: text('status').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Spark Marketing Campaigns
export const sparkCampaigns = pgTable('spark_campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(),
  content: text('content').notNull(),
  targets: text('targets'),
  scheduleTime: text('schedule_time'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Spark Campaign Execution Logs
export const sparkLogs = pgTable('spark_logs', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id'),
  status: text('status').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, () => ({}));

export const omniConversationsRelations = relations(omniConversations, ({ many }) => ({
  messages: many(omniMessages),
}));

export const omniMessagesRelations = relations(omniMessages, ({ one }) => ({
  conversation: one(omniConversations, {
    fields: [omniMessages.conversationId],
    references: [omniConversations.id],
  }),
}));
