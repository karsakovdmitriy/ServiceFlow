'use client';

import React, { useMemo } from 'react';
import {
  IconClock,
  IconCalendar,
  IconCheck,
  IconX,
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
  const todaySessions = useMemo(() => {
    return sessions.filter(s => s.date === todayStr);
  }, [sessions, todayStr]);

  // Dynamic stats
  const activeClients = new Set([...sessions.map(s => s.name), ...requests.map(r => r.name)]).size;
  const pendingCount = requests.length;

  const [showHint, setShowHint] = React.useState(true);
  const [showAllEvents, setShowAllEvents] = React.useState(false);

  const displayEvents = useMemo(() => {
    return showAllEvents ? events : events.slice(0, 5);
  }, [events, showAllEvents]);

  return (
    <div className="animate-fade-up max-w-[1100px] mx-auto space-y-16">
      {/* Metrics Section (Overview) - Flat Layers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Доход', val: (sessions.length * 2500).toLocaleString('ru-RU') + ' ₽', sub: 'За сегодня' },
          { label: 'Сессии', val: sessions.length, sub: 'Всего' },
          { label: 'Клиенты', val: activeClients, sub: 'Активные' },
          { label: 'Заявки', val: pendingCount, sub: 'Ожидают', highlight: pendingCount > 0 },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col">
            <div className="text-[32px] font-bold tracking-tight leading-none mb-2 text-t1">
                {stat.val}
            </div>
            <div className="text-[11px] text-t3 font-bold uppercase tracking-widest">{stat.label}</div>
            <div className="text-[10px] text-t3 mt-1 font-medium opacity-60 italic">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* LEFT COLUMN: Main Agenda & Requests */}
        <div className="lg:col-span-8 space-y-16">

          {/* Agenda */}
          <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">Повестка дня</h2>
                <span className="text-[11px] font-medium text-t3 opacity-60">{todaySessions.length} записей</span>
            </div>
            <div className="space-y-4">
              {todaySessions.length === 0 && (
                <div className="py-12 text-center text-t3 text-[13px] font-medium opacity-50 italic">
                    На сегодня нет записей
                </div>
              )}
              {todaySessions.map((session, i) => (
                <div key={i} className="group flex items-center gap-6 py-4 border-b border-border-light last:border-0 hover:bg-bg-custom/50 rounded-xl px-4 -mx-4 transition-all">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-[12px] font-bold text-t2 shrink-0">
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-t1 tracking-tight">{session.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-2">
                      <IconClock size={13} stroke={1.5} /> {session.time}
                    </div>
                  </div>
                  <div className="flex items-center text-[12px] font-medium text-green-custom">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-custom mr-2"></span>
                    Подтверждено
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New Requests */}
          <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">Новые заявки</h2>
                {pendingCount > 0 && (
                  <span className="text-[11px] font-bold text-accent tracking-wider">{pendingCount} ОЖИДАЮТ</span>
                )}
            </div>
            <div className="space-y-4">
              {requests.length === 0 && (
                <div className="py-12 text-center text-t3 text-[13px] font-medium opacity-50 italic">
                    Новых заявок нет
                </div>
              )}
              {requests.map((req, i) => (
                <div key={i} className="group flex items-center gap-6 py-4 border-b border-border-light last:border-0 hover:bg-bg-custom/50 rounded-xl px-4 -mx-4 transition-all">
                  <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-[12px] font-bold text-accent shrink-0">
                    {req.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-t1 tracking-tight">{req.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-2">
                      <IconCalendar size={13} stroke={1.5} /> {req.date} · {req.time}
                    </div>
                  </div>
                  <div className="flex gap-2 mgmt-icon">
                    <button
                      onClick={() => approveRequest(req.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-green-custom hover:bg-green-50 transition-all"
                    >
                      <IconCheck size={20} stroke={2} />
                    </button>
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-red-custom hover:bg-red-50 transition-all"
                    >
                      <IconX size={20} stroke={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Activity & Hints */}
        <div className="lg:col-span-4 space-y-16">

          {/* Recent Events */}
          <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">События</h2>
            </div>
            <div className="space-y-8">
              {events.length === 0 && (
                <div className="text-center py-4 text-t3 text-[12px] italic opacity-50">Событий пока нет</div>
              )}
              {displayEvents.map((act, i) => {
                const date = new Date(act.created_at);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffMin = Math.floor(diffMs / 60000);
                const diffHr = Math.floor(diffMin / 60);
                const diffDay = Math.floor(diffHr / 24);

                let timeStr = 'Только что';
                if (diffDay > 0) timeStr = `${diffDay}д`;
                else if (diffHr > 0) timeStr = `${diffHr}ч`;
                else if (diffMin > 0) timeStr = `${diffMin}м`;

                const dotColor =
                  act.type === 'booking' ? 'bg-green-custom' :
                  act.type === 'system' ? 'bg-accent' :
                  act.type === 'message' ? 'bg-blue-custom' : 'bg-yellow-custom';

                const textColor =
                  act.type === 'booking' ? 'text-green-custom' :
                  act.type === 'system' ? 'text-accent' :
                  act.type === 'message' ? 'text-blue-custom' : 'text-yellow-custom';

                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full block ${dotColor}`}></span>
                    </div>
                    <div className="flex-1">
                      <div className={`text-[13px] leading-relaxed font-medium ${textColor}`}>{act.message}</div>
                      <div className="text-[10px] text-t3 mt-1 font-bold uppercase tracking-widest opacity-60">{timeStr}</div>
                    </div>
                  </div>
                );
              })}
              {events.length > 5 && (
                <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
                >
                    {showAllEvents ? 'Свернуть' : `Показать все (${events.length})`}
                </button>
              )}
            </div>
          </section>

          {/* Hint Card */}
          {showHint && (
            <div className="relative group">
              <button
                onClick={() => setShowHint(false)}
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-surface border border-border-light rounded-full text-t3 hover:text-t1 mgmt-icon"
              >
                <IconX size={12} stroke={2} />
              </button>
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-surface">
                <div className="w-9 h-9 rounded-xl bg-accent/5 flex items-center justify-center shrink-0 text-accent border border-accent/10">
                  <IconBulb size={18} stroke={1.5} />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-t1 tracking-tight">Совет дня</div>
                  <p className="text-[12.5px] text-t2 mt-1 leading-relaxed font-medium">
                    Заполните заблокированные часы на следующую неделю для личного времени.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal - Full Viewport */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl p-8 max-w-sm w-full animate-fade-up border border-border-light">
                <div className="text-[18px] font-bold text-t1 mb-2 tracking-tight">Отклонить заявку?</div>
                <p className="text-[14px] text-t3 mb-8 leading-relaxed font-medium">Вы можете просто отклонить запись или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleReject(rejectingId, true)}
                        className="w-full bg-accent text-white py-3 rounded-2xl text-[14px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => handleReject(rejectingId, false)}
                        className="w-full bg-bg-custom text-red-custom py-3 rounded-2xl text-[14px] font-bold hover:bg-red-50 transition-all"
                    >
                        Отклонить без переноса
                    </button>
                    <button
                        onClick={() => setRejectingId(null)}
                        className="w-full py-3 text-t3 text-[14px] font-bold hover:text-t1 transition-all"
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
