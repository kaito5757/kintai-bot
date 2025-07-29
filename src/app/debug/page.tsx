'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Navigation from '@/components/Navigation';

export default function DebugPage() {
  const [workSession, setWorkSession] = useState({
    userId: '',
    channelId: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: '',
  });

  const [breakSession, setBreakSession] = useState({
    workSessionId: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddWorkSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/debug/work-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workSession),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`業務記録を追加しました (ID: ${data.id})`);
        setWorkSession({
          userId: '',
          channelId: '',
          startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          endTime: '',
        });
      } else {
        const error = await response.text();
        setMessage(`エラー: ${error}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBreakSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/debug/break-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(breakSession),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`休憩記録を追加しました (ID: ${data.id})`);
        setBreakSession({
          workSessionId: '',
          startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          endTime: '',
        });
      } else {
        const error = await response.text();
        setMessage(`エラー: ${error}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">デバッグツール</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 業務記録追加フォーム */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">業務記録を追加</h2>
            <form onSubmit={handleAddWorkSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザーID
                </label>
                <input
                  type="text"
                  value={workSession.userId}
                  onChange={(e) => setWorkSession({ ...workSession, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チャンネルID
                </label>
                <input
                  type="text"
                  value={workSession.channelId}
                  onChange={(e) => setWorkSession({ ...workSession, channelId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始時刻
                </label>
                <input
                  type="datetime-local"
                  value={workSession.startTime}
                  onChange={(e) => setWorkSession({ ...workSession, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了時刻（任意）
                </label>
                <input
                  type="datetime-local"
                  value={workSession.endTime}
                  onChange={(e) => setWorkSession({ ...workSession, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '追加中...' : '業務記録を追加'}
              </button>
            </form>
          </div>

          {/* 休憩記録追加フォーム */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">休憩記録を追加</h2>
            <form onSubmit={handleAddBreakSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業務セッションID
                </label>
                <input
                  type="text"
                  value={breakSession.workSessionId}
                  onChange={(e) => setBreakSession({ ...breakSession, workSessionId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始時刻
                </label>
                <input
                  type="datetime-local"
                  value={breakSession.startTime}
                  onChange={(e) => setBreakSession({ ...breakSession, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了時刻（任意）
                </label>
                <input
                  type="datetime-local"
                  value={breakSession.endTime}
                  onChange={(e) => setBreakSession({ ...breakSession, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '追加中...' : '休憩記録を追加'}
              </button>
            </form>
          </div>
        </div>

        {/* 使用方法 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">使用方法</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• ユーザーIDとチャンネルIDはSlackのIDを使用してください</li>
            <li>• 業務記録を追加すると、そのIDが返されます</li>
            <li>• 休憩記録は業務セッションIDに紐づけて追加してください</li>
            <li>• 終了時刻を空にすると「進行中」として記録されます</li>
          </ul>
        </div>
      </div>
    </>
  );
}