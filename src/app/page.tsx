'use client';

import React, { useMemo } from 'react';
import {
  IconCalendarCheck,
  IconUsers,
  IconClockHour4,
  IconCurrencyRubel,
  IconClock,
  IconCalendar,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconBulb
} from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function Dashboard() {
  const { sessions, requests, approveRequest, rejectRequest, profile, events } = useStore();
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);

  const handleReject = (id: string, reschedule: boolean) => {
    rejectRequest(id, reschedule);
    setRejectingId(null);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  const todaySessions = useMemo(() => {
    return sessions.filter(s => s.date === todayStr);
  }, [sessions, todayStr]);

  // Dynamic stats
  const activeClients = new Set([...sessions.map(s => s.name), ...requests.map(r => r.name)]).size;
  const pendingCount = requests.length;

  const [showHint, setShowHint] = React.useState(true);

  return (
    <div className="animate-fade-up max-w-[1200px] mx-auto">
      {/* Minimal Greeting */}
      <div className="mb-8 mt-2">
        <h1 className="text-[24px] font-bold text-t1 tracking-tight">Добрый день, {profile?.full_name?.split(' ')[0] || 'Тренер'} 👋</h1>
        <p className="text-[14px] text-t3 mt-1">Сегодня {todayLabel}. У вас {todaySessions.length} запланированных встреч.</p>
      </div>

      {/* Main Grid: Now vs Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT COLUMN: NOW */}
        <div className="xl:col-span-7 space-y-6">
          <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-[-8px]">Сейчас</div>
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-t1">Повестка дня</h2>
            <span className="text-[11px] font-medium text-accent bg-accent/5 px-2 py-1 rounded-r-md">{todaySessions.length} записей</span>
          </div>
          {todaySessions.length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">На сегодня нет записей</div>
          )}
          {todaySessions.map((session, i) => (
            <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
              <div className="w-[38px] h-[38px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[11.5px] font-bold shrink-0">
                {session.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-t1">{session.name}</div>
                <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
                  <IconClock size={11} /> {session.time}
                </div>
              </div>
              <span className="text-[11px] font-semibold px-[10px] py-1 rounded-full bg-green-light text-green-custom">Подтверждено</span>
            </div>
          ))}
        </div>

        {/* New Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-t1">Новые заявки</h2>
            {pendingCount > 0 && (
              <span className="bg-red-custom text-white text-[10px] font-bold rounded-full px-2 py-0.5">{pendingCount}</span>
            )}
          </div>
          {requests.length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">Новых заявок нет</div>
          )}
          {requests.map((req, i) => (
            <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
              <div className="w-[38px] h-[38px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[11.5px] font-bold shrink-0">
                {req.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-t1">{req.name}</div>
                <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
                  <IconCalendar size={11} /> {req.date} · {req.time}
                </div>
              </div>
              <div className="flex gap-[7px] shrink-0">
                <button
                  onClick={() => approveRequest(req.id)}
                  className="bg-green-light text-green-custom border border-green-custom/20 text-[12px] font-medium p-1.5 rounded-r-sm hover:bg-green-custom hover:text-white transition-all"
                >
                  <IconCheck size={14} />
                </button>
                <button
                  onClick={() => setRejectingId(req.id)}
                  className="bg-red-light text-red-custom border border-red-custom/20 text-[12px] font-medium p-1.5 rounded-r-sm hover:bg-red-custom hover:text-white transition-all"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-t1">События</h2>
          </div>
          {events.length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">Событий пока нет</div>
          )}
          {events.map((act, i) => {
            const date = new Date(act.created_at);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            const diffHr = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHr / 24);

            let timeStr = 'Только что';
            if (diffDay > 0) timeStr = `${diffDay} д`;
            else if (diffHr > 0) timeStr = `${diffHr} ч`;
            else if (diffMin > 0) timeStr = `${diffMin} мин`;

            const icon =
              act.type === 'booking' ? <IconCalendarCheck size={14} className="text-green-custom" /> :
              act.type === 'system' ? <IconClock size={14} className="text-accent" /> :
              act.type === 'message' ? <IconUsers size={14} className="text-blue-custom" /> :
              <IconBulb size={14} className="text-yellow-custom" />;

            const bgColor =
              act.type === 'booking' ? 'bg-green-light' :
              act.type === 'system' ? 'bg-accent-light' :
              act.type === 'message' ? 'bg-blue-light' : 'bg-yellow-light';

            return (
              <div key={i} className="flex items-start gap-3 py-[12px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${bgColor}`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-t1 leading-snug">{act.message}</div>
                  <div className="text-[11px] text-t3 mt-0.5">{timeStr}</div>
                </div>
              </div>
            );
          })}
        </div>

        </div>

        {/* RIGHT COLUMN: OVERVIEW */}
        <div className="xl:col-span-5 space-y-6">
          <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-[-8px]">Обзор</div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <IconCalendarCheck size={20} />, val: sessions.length, lbl: 'Сессии', color: 'gray' },
              { icon: <IconUsers size={20} />, val: activeClients, lbl: 'Клиенты', color: 'gray' },
              { icon: <IconClockHour4 size={20} />, val: pendingCount, lbl: 'Заявки', color: pendingCount > 0 ? 'yellow' : 'gray' },
              { icon: <IconCurrencyRubel size={20} />, val: (sessions.length * 2500).toLocaleString('ru-RU') + ' ₽', lbl: 'Доход', color: 'gray' },
            ].map((stat, i) => (
              <div key={i} className="card p-5 hover:shadow-sh-md transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  stat.color === 'yellow' ? 'bg-yellow-light text-yellow-custom' : 'bg-bg-custom text-t3 group-hover:text-accent group-hover:bg-accent-light'
                }`}>
                  {stat.icon}
                </div>
                <div className="text-[20px] font-bold text-t1 tracking-tight leading-none mb-1.5">{stat.val}</div>
                <div className="text-[12px] text-t3 font-medium">{stat.lbl}</div>
              </div>
            ))}
          </div>

          {/* Performance Hint (Collapsible) */}
          {showHint && (
            <div className="card bg-bg-custom border-accent/20 relative overflow-hidden group">
              <div className="absolute top-3 right-3 text-t3 hover:text-t1 cursor-pointer transition-colors" onClick={() => setShowHint(false)}>
                <IconX size={16} />
              </div>
              <div className="flex items-start gap-4 pr-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
                  <IconBulb size={20} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-t1">Совет дня</div>
                  <p className="text-[13px] text-t2 mt-1 leading-relaxed">
                    Заполните заблокированные часы в расписании на следующую неделю для личного времени.
                  </p>
                  <button className="mt-4 text-accent text-[12px] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Настроить график →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
                <div className="text-[16px] font-bold text-t1 mb-2">Отклонить заявку?</div>
                <p className="text-[13px] text-t3 mb-6">Вы можете просто отклонить запись или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => handleReject(rejectingId, true)}
                        className="w-full bg-accent text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => handleReject(rejectingId, false)}
                        className="w-full bg-red-custom text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-600 transition-all"
                    >
                        Отклонить без переноса
                    </button>
                    <button
                        onClick={() => setRejectingId(null)}
                        className="w-full bg-bg-custom text-t2 py-2.5 rounded-xl text-[13px] font-bold hover:bg-border-light transition-all"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
