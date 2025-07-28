import { db } from '@/db';
import { slackUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SlackUserInfo {
  slackUserId: string;
  username?: string;
  displayName?: string;
  realName?: string;
  email?: string;
  teamId: string; // 必須に変更
}

export class SlackUserManager {
  // ユーザー情報を取得または作成
  static async getOrCreateUser(userInfo: SlackUserInfo) {
    // 既存ユーザーを検索
    const existingUser = await db
      .select()
      .from(slackUsers)
      .where(eq(slackUsers.slackUserId, userInfo.slackUserId))
      .limit(1);

    if (existingUser.length > 0) {
      // 既存ユーザーの情報を更新
      await db
        .update(slackUsers)
        .set({
          username: userInfo.username || existingUser[0].username,
          displayName: userInfo.displayName || existingUser[0].displayName,
          realName: userInfo.realName || existingUser[0].realName,
          email: userInfo.email || existingUser[0].email,
          teamId: userInfo.teamId,
          updatedAt: new Date(),
        })
        .where(eq(slackUsers.slackUserId, userInfo.slackUserId));

      return existingUser[0];
    } else {
      // 新規ユーザーを作成
      const newUser = await db
        .insert(slackUsers)
        .values({
          slackUserId: userInfo.slackUserId,
          teamId: userInfo.teamId,
          username: userInfo.username,
          displayName: userInfo.displayName,
          realName: userInfo.realName,
          email: userInfo.email,
        })
        .returning();

      return newUser[0];
    }
  }

  // SlackユーザーIDからDB内部IDを取得
  static async getUserId(slackUserId: string): Promise<string | null> {
    const user = await db
      .select({ id: slackUsers.id })
      .from(slackUsers)
      .where(eq(slackUsers.slackUserId, slackUserId))
      .limit(1);

    return user.length > 0 ? user[0].id : null;
  }

  // Slack APIからユーザー情報を取得
  static async fetchSlackUserInfo(slackUserId: string): Promise<SlackUserInfo | null> {
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    
    if (!slackBotToken) {
      console.error('SLACK_BOT_TOKEN not found');
      return null;
    }

    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${slackUserId}`, {
        headers: {
          'Authorization': `Bearer ${slackBotToken}`,
        },
      });

      const data = await response.json();
      console.log(`Slack User API応答:`, JSON.stringify(data, null, 2));

      if (data.ok && data.user) {
        const user = data.user;
        console.log(`取得したユーザー情報 - teamId: ${user.team_id}`);
        return {
          slackUserId: user.id,
          username: user.name,
          displayName: user.profile?.display_name || user.profile?.real_name,
          realName: user.profile?.real_name,
          email: user.profile?.email,
          teamId: user.team_id,
        };
      }
    } catch (error) {
      console.error('Slack API error:', error);
    }

    return null;
  }

  // ユーザー情報を自動的に取得・更新
  static async ensureUser(slackUserId: string) {
    // Slack APIからユーザー情報を取得
    const userInfo = await this.fetchSlackUserInfo(slackUserId);
    
    if (userInfo) {
      return await this.getOrCreateUser(userInfo);
    } else {
      // API取得失敗時は最小限の情報で作成
      return await this.getOrCreateUser({ slackUserId, teamId: 'unknown' });
    }
  }
}