'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface ChannelUser {
  user: {
    id: string;
    slackUserId: string;
    username: string;
    displayName: string;
    realName: string;
    email: string;
    teamId: string;
    isActive: string;
    createdAt: string;
  };
  sessionCount: number;
  lastSession: string;
}

export default function ChannelUsersPage() {
  const [users, setUsers] = useState<ChannelUser[]>([]);
  const [channelName, setChannelName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const channelId = decodeURIComponent(params.channelId as string);

  useEffect(() => {
    fetchChannelUsers();
  }, [channelId]);

  const fetchChannelUsers = async () => {
    setLoading(true);
    try {
      // チャンネルのユーザー一覧を取得
      const response = await fetch(`/api/admin/channels/${encodeURIComponent(channelId)}/users`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
      
      // チャンネル名を取得
      const channelResponse = await fetch('/api/admin/companies');
      const channelResult = await channelResponse.json();
      if (channelResult.success) {
        const channel = channelResult.data.find((c: any) => c.channelId === channelId);
        setChannelName(channel?.companyName || `Channel: ${channelId}`);
      }
    } catch (error) {
      console.error('チャンネルユーザーデータの取得に失敗:', error);
    }
    setLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: ja });
  };

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        {/* パンくずナビゲーション */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/attendance" className="hover:text-gray-700">
              🏢 会社一覧
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              👥 {channelName || 'メンバー一覧'}
            </span>
          </nav>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">メンバー一覧</h1>
          <p className="text-gray-600">
            {channelName || channelId}のメンバー
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー情報</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メール</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セッション数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終活動</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium">メンバーが見つかりません</p>
                          <p className="text-sm">このチャンネルにはまだ勤怠記録がありません</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((channelUser) => (
                      <tr 
                        key={channelUser.user.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/attendance/${encodeURIComponent(channelId)}/${encodeURIComponent(channelUser.user.slackUserId)}`)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{channelUser.user.realName || channelUser.user.displayName}</div>
                            <div className="text-sm text-gray-500">@{channelUser.user.username}</div>
                            <div className="text-xs text-gray-400">ID: {channelUser.user.slackUserId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{channelUser.user.email || '未設定'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {channelUser.sessionCount}回
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {channelUser.lastSession ? formatDateTime(channelUser.lastSession) : '未使用'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            channelUser.user.isActive === 'true' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {channelUser.user.isActive === 'true' ? 'アクティブ' : '非アクティブ'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}