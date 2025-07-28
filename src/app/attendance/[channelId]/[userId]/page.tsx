import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getUserAttendanceData, getCompanies } from '@/lib/admin-data';
import UserAttendanceClient from './UserAttendanceClient';

interface PageProps {
  params: Promise<{ channelId: string; userId: string }>;
}

export default async function UserAttendancePage({ params }: PageProps) {
  const { channelId, userId } = await params;
  
  const [sessionsData, companies] = await Promise.all([
    getUserAttendanceData(userId, channelId),
    getCompanies()
  ]);
  
  const decodedChannelId = decodeURIComponent(channelId);
  const channel = companies.find(c => c.channelId === decodedChannelId);
  const channelName = channel?.companyName || decodedChannelId;
  
  const user = sessionsData.length > 0 ? sessionsData[0].user : null;

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
            <Link href={`/attendance/${encodeURIComponent(channelId)}`} className="hover:text-gray-700">
              👥 {channelName}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              📊 {user?.realName || user?.displayName || 'ユーザー'}の勤怠
            </span>
          </nav>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.realName || user?.displayName || 'ユーザー'}の勤怠管理
          </h1>
          <p className="text-gray-600">
            @{user?.username} | {channelName}
          </p>
        </div>

        {/* クライアントコンポーネントに渡す */}
        <UserAttendanceClient 
          initialSessions={sessionsData} 
          channelName={channelName}
          user={user}
        />
      </div>
    </>
  );
}