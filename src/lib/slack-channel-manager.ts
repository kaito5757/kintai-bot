import { db } from '@/db';
import { slackChannels } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SlackChannelInfo {
  slackChannelId: string;
  channelName?: string;
  channelType?: string;
}

export class SlackChannelManager {
  // チャンネル情報を取得または作成
  static async getOrCreateChannel(channelInfo: SlackChannelInfo) {
    // 既存チャンネルを検索
    const existingChannel = await db
      .select()
      .from(slackChannels)
      .where(eq(slackChannels.slackChannelId, channelInfo.slackChannelId))
      .limit(1);

    if (existingChannel.length > 0) {
      // 既存チャンネルの情報を更新
      await db
        .update(slackChannels)
        .set({
          channelName: channelInfo.channelName || existingChannel[0].channelName,
          channelType: channelInfo.channelType || existingChannel[0].channelType,
          updatedAt: new Date(),
        })
        .where(eq(slackChannels.slackChannelId, channelInfo.slackChannelId));

      return existingChannel[0];
    } else {
      // 新規チャンネルを作成
      const newChannel = await db
        .insert(slackChannels)
        .values({
          slackChannelId: channelInfo.slackChannelId,
          channelName: channelInfo.channelName,
          channelType: channelInfo.channelType,
        })
        .returning();

      return newChannel[0];
    }
  }

  // Slack APIからチャンネル情報を取得
  static async fetchSlackChannelInfo(channelId: string): Promise<SlackChannelInfo | null> {
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    
    if (!slackBotToken) {
      console.error('SLACK_BOT_TOKEN not found');
      return null;
    }

    try {
      console.log(`チャンネル情報取得開始: ${channelId}`);
      const response = await fetch(`https://slack.com/api/conversations.info?channel=${channelId}`, {
        headers: {
          'Authorization': `Bearer ${slackBotToken}`,
        },
      });

      const data = await response.json();
      console.log(`Slack API応答:`, JSON.stringify(data, null, 2));

      if (data.ok && data.channel) {
        const channel = data.channel;
        console.log(`取得成功: ${channel.name}`);
        return {
          slackChannelId: channel.id,
          channelName: channel.name,
          channelType: this.getChannelType(channel),
        };
      } else {
        console.error('Slack API エラー:', data.error);
      }
    } catch (error) {
      console.error('Slack API fetch error:', error);
    }

    return null;
  }

  // チャンネルタイプを判定
  private static getChannelType(channel: any): string {
    if (channel.is_im) return 'im';
    if (channel.is_mpim) return 'mpim';
    if (channel.is_private) return 'private';
    if (channel.is_channel) return 'public';
    return 'unknown';
  }

  // チャンネル情報を自動的に取得・更新
  static async ensureChannel(channelId: string) {
    // Slack APIからチャンネル情報を取得
    const channelInfo = await this.fetchSlackChannelInfo(channelId);
    
    if (channelInfo) {
      return await this.getOrCreateChannel(channelInfo);
    } else {
      // API取得失敗時は最小限の情報で作成
      return await this.getOrCreateChannel({ 
        slackChannelId: channelId,
        channelName: `Unknown Channel (${channelId})`,
        channelType: 'unknown'
      });
    }
  }
}