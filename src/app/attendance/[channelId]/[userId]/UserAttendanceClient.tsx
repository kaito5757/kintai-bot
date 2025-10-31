'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 業務記録編集フォーム
function SessionEditForm({
  session,
  onSave,
  onCancel,
  utcToJstInput,
  loading,
}: {
  session: WorkSession;
  onSave: (id: string, startTime: string, endTime: string) => void;
  onCancel: () => void;
  utcToJstInput: (date: string) => string;
  loading: boolean;
}) {
  const [startTime, setStartTime] = useState(utcToJstInput(session.startTime));
  const [endTime, setEndTime] = useState(session.endTime ? utcToJstInput(session.endTime) : '');

  return (
    <div className="space-y-2 bg-blue-50 p-3 rounded">
      <div className="text-xs font-medium text-gray-700">業務時間を編集</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">開始</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">終了</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onSave(session.id, startTime, endTime)}
          disabled={loading}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '保存中...' : '保存'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-xs px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

// 休憩記録編集フォーム
function BreakEditForm({
  breakItem,
  onSave,
  onCancel,
  utcToJstInput,
  loading,
}: {
  breakItem: Break;
  onSave: (id: string, startTime: string, endTime: string) => void;
  onCancel: () => void;
  utcToJstInput: (date: string) => string;
  loading: boolean;
}) {
  const [startTime, setStartTime] = useState(utcToJstInput(breakItem.startTime));
  const [endTime, setEndTime] = useState(breakItem.endTime ? utcToJstInput(breakItem.endTime) : '');

  return (
    <div className="space-y-2 bg-orange-50 p-2 rounded text-sm">
      <div className="text-xs font-medium text-gray-700">☕ 休憩時間を編集</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">開始</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">終了</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onSave(breakItem.id, startTime, endTime)}
          disabled={loading}
          className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
        >
          {loading ? '保存中...' : '保存'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-xs px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

// 休憩記録追加フォーム
function BreakAddForm({
  sessionId,
  sessionStartTime,
  onAdd,
  onCancel,
  loading,
}: {
  sessionId: string;
  sessionStartTime: string;
  onAdd: (sessionId: string, startTime: string, endTime: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  // 業務記録の日付を初期値として使用
  const sessionDate = format(new Date(sessionStartTime), "yyyy-MM-dd");
  const currentTime = format(new Date(), 'HH:mm');
  const [startTime, setStartTime] = useState(`${sessionDate}T${currentTime}`);
  const [endTime, setEndTime] = useState('');

  return (
    <div className="space-y-2 bg-green-50 p-2 rounded text-sm">
      <div className="text-xs font-medium text-gray-700">☕ 休憩を追加</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">開始（日本時間）</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">終了（日本時間）</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onAdd(sessionId, startTime, endTime)}
          disabled={loading}
          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? '追加中...' : '追加'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-xs px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

// 業務記録追加フォーム
function WorkSessionAddForm({
  onAdd,
  onCancel,
  loading,
}: {
  onAdd: (startTime: string, endTime: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState('');

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">📝 業務記録を追加</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻（日本時間）</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻（日本時間・任意）</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onAdd(startTime, endTime)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '追加中...' : '追加'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

interface WorkSession {
  id: string;
  startTime: string;
  endTime: string | null;
  slackUserId: string;
  slackChannelId: string;
  createdAt: string;
  updatedAt: string;
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
  channel: {
    id: string;
    slackChannelId: string;
    channelName: string;
    channelType: string;
    isActive: string;
    createdAt: string;
  };
  breaks: Break[];
}

interface Break {
  id: string;
  workSessionId: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserAttendanceClientProps {
  initialSessions: WorkSession[];
  channelName: string;
  channelId: string;
  user: WorkSession['user'] | null;
}

export default function UserAttendanceClient({
  initialSessions,
  channelName,
  channelId,
  user
}: UserAttendanceClientProps) {
  const [sessions, setSessions] = useState<WorkSession[]>(initialSessions);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  // URLパラメータから月を取得、なければ現在の月
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('month') || format(new Date(), 'yyyy-MM');
    }
    return format(new Date(), 'yyyy-MM');
  });
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingBreak, setEditingBreak] = useState<string | null>(null);
  const [addingBreakFor, setAddingBreakFor] = useState<string | null>(null);
  const [addingWorkSession, setAddingWorkSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 月を選択したらURLを更新
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const url = new URL(window.location.href);
    url.searchParams.set('month', month);
    window.history.pushState({}, '', url.toString());
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: ja });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ja });
  };

  // UTCをJST(日本時間)の文字列に変換（datetime-local用）
  const utcToJstInput = (utcDateString: string): string => {
    // UTC文字列をDateオブジェクトとして解釈（これは正しくUTCとして扱われる）
    const utcDate = new Date(utcDateString);
    // 日本時間 = UTC + 9時間
    const jstTimestamp = utcDate.getTime() + 9 * 60 * 60 * 1000;
    const jstDate = new Date(jstTimestamp);

    // datetime-local形式に変換（YYYY-MM-DDTHH:mm）
    const year = jstDate.getUTCFullYear();
    const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getUTCDate()).padStart(2, '0');
    const hours = String(jstDate.getUTCHours()).padStart(2, '0');
    const minutes = String(jstDate.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // JST(日本時間)の文字列をUTCに変換
  const jstToUtc = (jstDateTimeString: string): string => {
    if (!jstDateTimeString) return '';

    // datetime-localの値（例: "2025-01-15T10:30"）をパース
    const [datePart, timePart] = jstDateTimeString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // 日本時間としてDateオブジェクトを作成（UTC基準で作成）
    // 日本時間 = UTC + 9時間なので、UTC = 日本時間 - 9時間
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 9, minutes));

    return utcDate.toISOString();
  };

  // 業務記録の更新
  const handleUpdateSession = async (sessionId: string, startTime: string, endTime: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/work-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: jstToUtc(startTime),
          endTime: endTime ? jstToUtc(endTime) : null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '業務記録を更新しました' });
        setEditingSession(null);
        // セッションを再取得
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: '更新に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // 業務記録の削除
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('この業務記録を削除しますか？')) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/work-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '業務記録を削除しました' });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: '削除に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // 休憩記録の更新
  const handleUpdateBreak = async (breakId: string, startTime: string, endTime: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/breaks/${breakId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: jstToUtc(startTime),
          endTime: endTime ? jstToUtc(endTime) : null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '休憩記録を更新しました' });
        setEditingBreak(null);
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: '更新に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // 休憩記録の削除
  const handleDeleteBreak = async (breakId: string) => {
    if (!confirm('この休憩記録を削除しますか？')) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/breaks/${breakId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '休憩記録を削除しました' });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: '削除に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // 休憩記録の追加
  const handleAddBreak = async (workSessionId: string, startTime: string, endTime: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/breaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workSessionId,
          startTime: jstToUtc(startTime),
          endTime: endTime ? jstToUtc(endTime) : null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '休憩記録を追加しました' });
        setAddingBreakFor(null);
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: '追加に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // 業務記録の追加
  const handleAddWorkSession = async (startTime: string, endTime: string) => {
    if (!user) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/work-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.slackUserId,
          channelId: channelId,
          startTime: jstToUtc(startTime),
          endTime: endTime ? jstToUtc(endTime) : null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '業務記録を追加しました' });
        setAddingWorkSession(false);
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: '追加に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const calculateSessionDuration = (session: WorkSession) => {
    if (!session.endTime) return '進行中';
    
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (totalMinutes < 1) return '1分未満';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const calculateBreakDuration = (breaks: Break[]) => {
    let totalMinutes = 0;
    breaks.forEach(breakItem => {
      if (breakItem.endTime) {
        const start = new Date(breakItem.startTime);
        const end = new Date(breakItem.endTime);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      }
    });
    
    const roundedMinutes = Math.floor(totalMinutes);
    
    if (roundedMinutes < 1) return '1分未満';
    
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const groupSessionsByMonth = (sessions: WorkSession[]) => {
    const grouped: { [key: string]: WorkSession[] } = {};
    sessions.forEach(session => {
      const monthKey = format(new Date(session.startTime), 'yyyy-MM', { locale: ja });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(session);
    });
    return grouped;
  };

  const groupSessionsByDay = (sessions: WorkSession[]) => {
    const grouped: { [key: string]: WorkSession[] } = {};
    sessions.forEach(session => {
      const dayKey = format(new Date(session.startTime), 'yyyy-MM-dd', { locale: ja });
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(session);
    });
    return grouped;
  };

  const calculateMonthlyStats = (sessions: WorkSession[]) => {
    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;
    let completedSessions = 0;

    sessions.forEach(session => {
      if (session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        totalWorkMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
        completedSessions++;

        session.breaks.forEach(breakItem => {
          if (breakItem.endTime) {
            const breakStart = new Date(breakItem.startTime);
            const breakEnd = new Date(breakItem.endTime);
            totalBreakMinutes += (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
          }
        });
      }
    });

    const workMinutesRounded = Math.floor(totalWorkMinutes);
    const breakMinutesRounded = Math.floor(totalBreakMinutes);
    const actualWorkMinutesRounded = workMinutesRounded - breakMinutesRounded;
    
    const workHours = Math.floor(workMinutesRounded / 60);
    const workMinutes = workMinutesRounded % 60;
    const breakHours = Math.floor(breakMinutesRounded / 60);
    const breakMinutesRemainder = breakMinutesRounded % 60;
    const actualWorkHours = Math.floor(actualWorkMinutesRounded / 60);
    const actualWorkMinutes = actualWorkMinutesRounded % 60;

    const workTimeStr = workMinutesRounded < 1 ? '1分未満' : 
      workHours > 0 ? `${workHours}時間${workMinutes}分` : `${workMinutes}分`;
    const breakTimeStr = breakMinutesRounded < 1 ? '1分未満' : 
      breakHours > 0 ? `${breakHours}時間${breakMinutesRemainder}分` : `${breakMinutesRemainder}分`;
    const actualWorkTimeStr = actualWorkMinutesRounded < 1 ? '1分未満' : 
      actualWorkHours > 0 ? `${actualWorkHours}時間${actualWorkMinutes}分` : `${actualWorkMinutes}分`;

    return {
      totalSessions: sessions.length,
      completedSessions,
      workTime: workTimeStr,
      breakTime: breakTimeStr,
      actualWorkTime: actualWorkTimeStr,
    };
  };

  const calculateDailyStats = (sessions: WorkSession[]) => {
    return calculateMonthlyStats(sessions);
  };

  const toggleDayExpansion = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const getAvailableMonths = () => {
    const months = new Set<string>();
    sessions.forEach(session => {
      const monthKey = format(new Date(session.startTime), 'yyyy-MM');
      months.add(monthKey);
    });
    return Array.from(months).sort();
  };

  const getFilteredSessions = () => {
    if (viewMode === 'monthly') {
      return sessions;
    }
    return sessions.filter(session => {
      const sessionMonth = format(new Date(session.startTime), 'yyyy-MM');
      return sessionMonth === selectedMonth;
    });
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a1 1 0 012-2h4a1 1 0 012 2v4M6 10v10a2 2 0 002 2h8a2 2 0 002-2V10M6 10L5 8m1 2h12m0 0l-1-2" />
          </svg>
          <p className="text-lg font-medium">勤怠記録がありません</p>
          <p className="text-sm">このユーザーの勤怠記録はまだありません</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* メッセージ表示 */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* 表示モード切り替え */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 日別詳細
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📅 月別集計
            </button>
          </div>
          
          {/* 月フィルター（日別表示時のみ） */}
          {viewMode === 'daily' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">表示月:</label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableMonths().map(month => (
                  <option key={month} value={month}>
                    {format(new Date(month + '-01'), 'yyyy年MM月', { locale: ja })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'daily' ? (
        <div className="space-y-6">
          {/* 業務記録追加ボタン */}
          {!addingWorkSession ? (
            <button
              onClick={() => setAddingWorkSession(true)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>業務記録を追加</span>
            </button>
          ) : (
            <WorkSessionAddForm
              onAdd={handleAddWorkSession}
              onCancel={() => setAddingWorkSession(false)}
              loading={loading}
            />
          )}

          {/* 月合計統計 */}
          {(() => {
            const filteredSessions = getFilteredSessions();
            if (filteredSessions.length > 0) {
              const monthStats = calculateMonthlyStats(filteredSessions);
              return (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    📊 {format(new Date(selectedMonth + '-01'), 'yyyy年MM月', { locale: ja })} 合計
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600">総勤務時間</div>
                      <div className="text-2xl font-bold text-purple-900">{monthStats.workTime}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-orange-600">総休憩時間</div>
                      <div className="text-2xl font-bold text-orange-900">{monthStats.breakTime}</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-sm text-indigo-600">実質勤務時間</div>
                      <div className="text-2xl font-bold text-indigo-900">{monthStats.actualWorkTime}</div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          {/* 日別詳細 */}
          <div className="space-y-4">
            {(() => {
              const dailyGroups = Object.entries(groupSessionsByDay(getFilteredSessions()));
              if (dailyGroups.length === 0) {
                return (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a1 1 0 012-2h4a1 1 0 012 2v4M6 10v10a2 2 0 002 2h8a2 2 0 002-2V10M6 10L5 8m1 2h12m0 0l-1-2" />
                      </svg>
                      <p className="text-lg font-medium">この月の勤怠記録がありません</p>
                      <p className="text-sm">
                        {format(new Date(selectedMonth + '-01'), 'yyyy年MM月', { locale: ja })}の勤怠記録はまだありません
                      </p>
                    </div>
                  </div>
                );
              }
              
              return dailyGroups
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, daySessions]) => {
              const stats = calculateDailyStats(daySessions);
              const firstSession = daySessions.sort((a, b) => 
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              )[0];
              const lastSession = daySessions.sort((a, b) => 
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
              )[0];
              const isExpanded = expandedDays.has(day);
              
              return (
                <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* 日別サマリー行（クリック可能） */}
                  <div 
                    className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => toggleDayExpansion(day)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="ml-2 text-lg font-medium text-gray-900">
                          {format(new Date(day), 'yyyy年MM月dd日 (E)', { locale: ja })}
                        </div>
                      </div>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>勤務: {stats.workTime}</span>
                        <span>休憩: {stats.breakTime}</span>
                        <span className="font-medium text-indigo-700">実質: {stats.actualWorkTime}</span>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>
                        {firstSession ? formatTime(firstSession.startTime) : '-'} 〜 {lastSession?.endTime ? formatTime(lastSession.endTime) : '進行中'}
                      </span>
                    </div>
                  </div>

                  {/* アコーディオンコンテンツ */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {/* 業務記録 */}
                      <div className="px-6 py-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">📋 業務記録</h4>
                        <div className="space-y-3">
                          {daySessions
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                            .map((session) => (
                            <div key={session.id} className="bg-gray-50 rounded-lg p-3">
                              {/* 業務セッション */}
                              {editingSession === session.id ? (
                                <SessionEditForm
                                  session={session}
                                  onSave={handleUpdateSession}
                                  onCancel={() => setEditingSession(null)}
                                  utcToJstInput={utcToJstInput}
                                  loading={loading}
                                />
                              ) : (
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                      {formatTime(session.startTime)} 〜{' '}
                                      {session.endTime ? formatTime(session.endTime) : (
                                        <span className="text-green-600 font-medium">進行中</span>
                                      )}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {calculateSessionDuration(session)}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSession(session.id);
                                      }}
                                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                      編集
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                      }}
                                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                      削除
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* 休憩記録（ネストされた表示） */}
                              <div className="ml-6 space-y-2 mt-2">
                                {session.breaks
                                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                  .map((breakItem) => (
                                    editingBreak === breakItem.id ? (
                                      <BreakEditForm
                                        key={breakItem.id}
                                        breakItem={breakItem}
                                        onSave={handleUpdateBreak}
                                        onCancel={() => setEditingBreak(null)}
                                        utcToJstInput={utcToJstInput}
                                        loading={loading}
                                      />
                                    ) : (
                                      <div key={breakItem.id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                        <div className="flex items-center space-x-3">
                                          <span className="text-orange-600">☕</span>
                                          <span className="text-gray-600">
                                            {formatTime(breakItem.startTime)} 〜{' '}
                                            {breakItem.endTime ? formatTime(breakItem.endTime) : (
                                              <span className="text-orange-600 font-medium">休憩中</span>
                                            )}
                                          </span>
                                          <span className="text-gray-500">
                                            {breakItem.endTime ?
                                              calculateBreakDuration([breakItem]) : '進行中'
                                            }
                                          </span>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingBreak(breakItem.id);
                                            }}
                                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                          >
                                            編集
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteBreak(breakItem.id);
                                            }}
                                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                          >
                                            削除
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  ))}

                                {/* 休憩追加フォーム */}
                                {addingBreakFor === session.id ? (
                                  <BreakAddForm
                                    sessionId={session.id}
                                    sessionStartTime={session.startTime}
                                    onAdd={handleAddBreak}
                                    onCancel={() => setAddingBreakFor(null)}
                                    loading={loading}
                                  />
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAddingBreakFor(session.id);
                                    }}
                                    className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center space-x-1"
                                  >
                                    <span>+</span>
                                    <span>休憩を追加</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
              });
            })()}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupSessionsByMonth(sessions))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, monthSessions]) => {
              const stats = calculateMonthlyStats(monthSessions);
              return (
                <div key={month} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {format(new Date(month + '-01'), 'yyyy年MM月', { locale: ja })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600">総勤務時間</div>
                      <div className="text-2xl font-bold text-purple-900">{stats.workTime}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-orange-600">総休憩時間</div>
                      <div className="text-2xl font-bold text-orange-900">{stats.breakTime}</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-sm text-indigo-600">実質勤務時間</div>
                      <div className="text-2xl font-bold text-indigo-900">{stats.actualWorkTime}</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
}