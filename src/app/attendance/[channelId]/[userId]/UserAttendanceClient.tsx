'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

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
  user: WorkSession['user'] | null;
}

export default function UserAttendanceClient({ 
  initialSessions, 
  channelName, 
  user 
}: UserAttendanceClientProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: ja });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ja });
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
    
    const workHours = Math.floor(workMinutesRounded / 60);
    const workMinutes = workMinutesRounded % 60;
    const breakHours = Math.floor(breakMinutesRounded / 60);
    const breakMinutesRemainder = breakMinutesRounded % 60;

    const workTimeStr = workMinutesRounded < 1 ? '1分未満' : 
      workHours > 0 ? `${workHours}時間${workMinutes}分` : `${workMinutes}分`;
    const breakTimeStr = breakMinutesRounded < 1 ? '1分未満' : 
      breakHours > 0 ? `${breakHours}時間${breakMinutesRemainder}分` : `${breakMinutesRemainder}分`;

    return {
      totalSessions: sessions.length,
      completedSessions,
      workTime: workTimeStr,
      breakTime: breakTimeStr,
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
    initialSessions.forEach(session => {
      const monthKey = format(new Date(session.startTime), 'yyyy-MM');
      months.add(monthKey);
    });
    return Array.from(months).sort();
  };

  const getFilteredSessions = () => {
    if (viewMode === 'monthly') {
      return initialSessions;
    }
    return initialSessions.filter(session => {
      const sessionMonth = format(new Date(session.startTime), 'yyyy-MM');
      return sessionMonth === selectedMonth;
    });
  };

  if (initialSessions.length === 0) {
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
                onChange={(e) => setSelectedMonth(e.target.value)}
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">総セッション数</div>
                      <div className="text-2xl font-bold text-blue-900">{monthStats.totalSessions}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">完了セッション数</div>
                      <div className="text-2xl font-bold text-green-900">{monthStats.completedSessions}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600">総勤務時間</div>
                      <div className="text-2xl font-bold text-purple-900">{monthStats.workTime}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-orange-600">総休憩時間</div>
                      <div className="text-2xl font-bold text-orange-900">{monthStats.breakTime}</div>
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
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {stats.totalSessions}セッション
                        </span>
                        <span>勤務: {stats.workTime}</span>
                        <span>休憩: {stats.breakTime}</span>
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
                      {/* 業務セッション一覧 */}
                      <div className="px-6 py-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">📋 業務セッション</h4>
                        <div className="space-y-2">
                          {daySessions
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                            .map((session) => (
                            <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
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
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 休憩一覧 */}
                      <div className="px-6 py-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">☕ 休憩記録</h4>
                        <div className="space-y-2">
                          {daySessions.flatMap(session => session.breaks).length === 0 ? (
                            <div className="text-sm text-gray-500 py-2">休憩記録はありません</div>
                          ) : (
                            daySessions
                              .flatMap(session => session.breaks)
                              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                              .map((breakItem) => (
                              <div key={breakItem.id} className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-gray-600">
                                    {formatTime(breakItem.startTime)} 〜{' '}
                                    {breakItem.endTime ? formatTime(breakItem.endTime) : (
                                      <span className="text-orange-600 font-medium">休憩中</span>
                                    )}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {breakItem.endTime ? 
                                      calculateBreakDuration([breakItem]) : '進行中'
                                    }
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
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
          {Object.entries(groupSessionsByMonth(initialSessions))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, monthSessions]) => {
              const stats = calculateMonthlyStats(monthSessions);
              return (
                <div key={month} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {format(new Date(month + '-01'), 'yyyy年MM月', { locale: ja })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">総セッション数</div>
                      <div className="text-2xl font-bold text-blue-900">{stats.totalSessions}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">完了セッション数</div>
                      <div className="text-2xl font-bold text-green-900">{stats.completedSessions}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600">総勤務時間</div>
                      <div className="text-2xl font-bold text-purple-900">{stats.workTime}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-orange-600">総休憩時間</div>
                      <div className="text-2xl font-bold text-orange-900">{stats.breakTime}</div>
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