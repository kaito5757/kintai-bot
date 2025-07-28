'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface Company {
  channelId: string;
  companyName: string;
  channelType: string;
  userCount: number;
  sessionCount: number;
  lastActivity: string;
}

export default function AttendancePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/companies');
      const result = await response.json();
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error('会社データの取得に失敗:', error);
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
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">会社一覧</h1>
          <p className="text-gray-600">チャンネル別の勤怠管理</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会社情報</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">利用者数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セッション数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終活動</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-lg font-medium">会社が見つかりません</p>
                          <p className="text-sm">まだ勤怠データのあるチャンネルがありません</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr 
                        key={company.channelId} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/attendance/${encodeURIComponent(company.channelId)}`)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                            <div className="text-sm text-gray-500">#{company.channelId}</div>
                            <div className="text-xs text-gray-400">{company.channelType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {company.userCount}人
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {company.sessionCount}回
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.lastActivity ? formatDateTime(company.lastActivity) : '未使用'}
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