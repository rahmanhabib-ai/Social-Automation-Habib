// src/db/system.ts
import { db } from './index.ts';
import {
  systemConfigs,
  omniConversations,
  omniMessages,
  socialPosts,
  socialRules,
  socialCannedResponses,
  socialExecutionLogs,
  sparkCampaigns,
  sparkLogs
} from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// --- System Configurations (Sidebar, Brand, AI, Automations, Payment, etc.) ---
export async function getSystemConfig(key: string): Promise<string | null> {
  try {
    const res = await db.select().from(systemConfigs).where(eq(systemConfigs.key, key)).limit(1);
    if (res.length > 0) {
      return res[0].value;
    }
    return null;
  } catch (error) {
    console.error(`Database query failed for config ${key}:`, error);
    throw new Error(`Failed to retrieve configuration: ${key}`, { cause: error });
  }
}

export async function getAllSystemConfigs(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(systemConfigs);
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  } catch (error) {
    console.error('Database query failed for getAllSystemConfigs:', error);
    throw new Error('Failed to retrieve all system configurations', { cause: error });
  }
}

export async function setSystemConfig(key: string, value: string): Promise<void> {
  try {
    await db.insert(systemConfigs)
      .values({
        key,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemConfigs.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error(`Database query failed for saving config ${key}:`, error);
    throw new Error(`Failed to save configuration: ${key}`, { cause: error });
  }
}

export async function setMultipleSystemConfigs(configs: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(configs)) {
    await setSystemConfig(key, value);
  }
}

// --- Omnichannel Conversations & Messages ---
export async function getDbOmniConversations() {
  try {
    const convs = await db.select().from(omniConversations);
    const allMsgs = await db.select().from(omniMessages);
    
    const msgsByConvId: Record<string, any[]> = {};
    for (const m of allMsgs) {
      if (!msgsByConvId[m.conversationId]) {
        msgsByConvId[m.conversationId] = [];
      }
      msgsByConvId[m.conversationId].push({
        id: m.id,
        conversationId: m.conversationId,
        sender: m.sender,
        senderName: m.senderName,
        text: m.text,
        mediaUrl: m.mediaUrl || undefined,
        mediaType: m.mediaType || undefined,
        timestamp: m.timestamp,
        isAiGenerated: !!m.isAiGenerated,
        intent: m.intent || undefined,
        status: m.status || undefined,
      });
    }

    return convs.map(c => ({
      id: c.id,
      platform: c.platform,
      customerName: c.customerName,
      customerHandle: c.customerHandle || '',
      customerAvatar: c.customerAvatar || '',
      lastMessage: c.lastMessage || '',
      lastMessageTime: c.lastMessageTime || new Date().toISOString(),
      unreadCount: c.unreadCount || 0,
      autoPilotEnabled: c.autoPilotEnabled !== false,
      isHandover: !!c.isHandover,
      status: c.status || 'active',
      messages: msgsByConvId[c.id] || [],
    }));
  } catch (error) {
    console.error('Database query failed for omni conversations:', error);
    throw new Error('Failed to retrieve omnichannel conversations', { cause: error });
  }
}

export async function saveDbOmniConversation(conv: any) {
  try {
    await db.insert(omniConversations)
      .values({
        id: conv.id,
        platform: conv.platform || 'whatsapp',
        customerName: conv.customerName || 'Customer',
        customerHandle: conv.customerHandle || null,
        customerAvatar: conv.customerAvatar || null,
        lastMessage: conv.lastMessage || null,
        lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
        unreadCount: conv.unreadCount || 0,
        autoPilotEnabled: conv.autoPilotEnabled !== false,
        isHandover: !!conv.isHandover,
        status: conv.status || 'active',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: omniConversations.id,
        set: {
          customerName: conv.customerName,
          customerHandle: conv.customerHandle || null,
          customerAvatar: conv.customerAvatar || null,
          lastMessage: conv.lastMessage || null,
          lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
          unreadCount: conv.unreadCount || 0,
          autoPilotEnabled: conv.autoPilotEnabled !== false,
          isHandover: !!conv.isHandover,
          status: conv.status || 'active',
          updatedAt: new Date(),
        },
      });

    if (Array.isArray(conv.messages)) {
      for (const m of conv.messages) {
        await db.insert(omniMessages)
          .values({
            id: m.id,
            conversationId: conv.id,
            sender: m.sender || 'customer',
            senderName: m.senderName || 'Customer',
            text: m.text || '',
            mediaUrl: m.mediaUrl || null,
            mediaType: m.mediaType || null,
            timestamp: m.timestamp || new Date().toISOString(),
            isAiGenerated: !!m.isAiGenerated,
            intent: m.intent || null,
            status: m.status || null,
          })
          .onConflictDoUpdate({
            target: omniMessages.id,
            set: {
              text: m.text || '',
              mediaUrl: m.mediaUrl || null,
              mediaType: m.mediaType || null,
              timestamp: m.timestamp || new Date().toISOString(),
              isAiGenerated: !!m.isAiGenerated,
              intent: m.intent || null,
              status: m.status || null,
            },
          });
      }
    }
  } catch (error) {
    console.error('Database query failed saving omni conversation:', error);
    throw new Error('Failed to save omnichannel conversation', { cause: error });
  }
}

// --- Social Posts, Rules, Canned Responses, Logs ---
export async function getDbSocialPosts() {
  try {
    const rows = await db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt));
    return rows.map(r => ({
      id: r.id,
      content: r.content,
      platforms: JSON.parse(r.platforms || '[]'),
      mediaUrls: r.mediaUrls ? JSON.parse(r.mediaUrls) : [],
      status: r.status,
      scheduledTime: r.scheduledTime || undefined,
      publishedTime: r.publishedTime || undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Database query failed for social posts:', error);
    throw new Error('Failed to retrieve social posts', { cause: error });
  }
}

export async function saveDbSocialPost(post: any) {
  try {
    await db.insert(socialPosts)
      .values({
        id: post.id,
        content: post.content,
        platforms: JSON.stringify(post.platforms || []),
        mediaUrls: JSON.stringify(post.mediaUrls || []),
        status: post.status,
        scheduledTime: post.scheduledTime || null,
        publishedTime: post.publishedTime || null,
      })
      .onConflictDoUpdate({
        target: socialPosts.id,
        set: {
          content: post.content,
          platforms: JSON.stringify(post.platforms || []),
          mediaUrls: JSON.stringify(post.mediaUrls || []),
          status: post.status,
          scheduledTime: post.scheduledTime || null,
          publishedTime: post.publishedTime || null,
        },
      });
  } catch (error) {
    console.error('Database query failed saving social post:', error);
    throw new Error('Failed to save social post', { cause: error });
  }
}

// --- Spark Campaigns & Logs ---
export async function getDbSparkCampaigns() {
  try {
    const rows = await db.select().from(sparkCampaigns).orderBy(desc(sparkCampaigns.createdAt));
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      channel: r.channel,
      status: r.status,
      content: r.content,
      targets: r.targets ? JSON.parse(r.targets) : [],
      scheduleTime: r.scheduleTime || undefined,
    }));
  } catch (error) {
    console.error('Database query failed for spark campaigns:', error);
    throw new Error('Failed to retrieve spark campaigns', { cause: error });
  }
}

export async function saveDbSparkCampaign(camp: any) {
  try {
    await db.insert(sparkCampaigns)
      .values({
        id: camp.id,
        name: camp.name,
        channel: camp.channel,
        status: camp.status,
        content: camp.content,
        targets: JSON.stringify(camp.targets || []),
        scheduleTime: camp.scheduleTime || null,
      })
      .onConflictDoUpdate({
        target: sparkCampaigns.id,
        set: {
          name: camp.name,
          channel: camp.channel,
          status: camp.status,
          content: camp.content,
          targets: JSON.stringify(camp.targets || []),
          scheduleTime: camp.scheduleTime || null,
        },
      });
  } catch (error) {
    console.error('Database query failed saving spark campaign:', error);
    throw new Error('Failed to save spark campaign', { cause: error });
  }
}
