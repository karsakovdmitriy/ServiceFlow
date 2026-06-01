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
    <div className="animate-fade-up max-w-[1100px] mx-auto space-y-12">
      {/* Metrics Section (Overview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
        {[
          { label: 'Доход', val: (sessions.length * 2500).toLocaleString('ru-RU') + ' ₽', sub: 'За сегодня' },
          { label: 'Сессии', val: sessions.length, sub: 'Всего' },
          { label: 'Клиенты', val: activeClients, sub: 'Активные' },
          { label: 'Заявки', val: pendingCount, sub: 'Ожидают', highlight: pendingCount > 0 },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col px-4 first:pl-0 last:pr-0 border-r border-border-light last:border-r-0">
            <div className="text-[11px] text-t3 font-bold uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`text-[28px] font-bold tracking-tight leading-none ${stat.highlight ? 'text-accent' : 'text-t1'}`}>
                {stat.val}
            </div>
            <div className="text-[11px] text-t3 mt-1.5 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COLUMN: Main Agenda & Requests */}
        <div className="lg:col-span-8 space-y-10">

          {/* Agenda */}
          <section className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Повестка дня</h2>
                <div className="h-px bg-border flex-1 mx-4"></div>
                <span className="text-[11px] font-bold text-t3">{todaySessions.length} записей</span>
            </div>
            <div className="space-y-1">
              {todaySessions.length === 0 && (
                <div className="py-10 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                    На сегодня нет записей
                </div>
              )}
              {todaySessions.map((session, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-bg-custom transition-all">
                  <div className="w-10 h-10 rounded-full bg-bg-custom flex items-center justify-center text-[11px] font-bold text-t2 shrink-0 border border-surface">
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-t1">{session.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5">
                      <IconClock size={12} stroke={1.5} /> {session.time}
                    </div>
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-green-custom">
                    <span className="status-dot bg-green-custom"></span>
                    Подтверждено
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New Requests */}
          <section className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Новые заявки</h2>
                <div className="h-px bg-border flex-1 mx-4"></div>
                {pendingCount > 0 && (
                  <span className="text-[11px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-full">{pendingCount} ожидают</span>
                )}
            </div>
            <div className="space-y-1">
              {requests.length === 0 && (
                <div className="py-10 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                    Новых заявок нет
                </div>
              )}
              {requests.map((req, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-bg-custom transition-all">
                  <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-[11px] font-bold text-accent shrink-0 border border-surface">
                    {req.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-t1">{req.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5">
                      <IconCalendar size={12} stroke={1.5} /> {req.date} · {req.time}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => approveRequest(req.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-green-custom hover:bg-green-50 transition-all"
                    >
                      <IconCheck size={18} stroke={2} />
                    </button>
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-custom hover:bg-red-50 transition-all"
                    >
                      <IconX size={18} stroke={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Activity & Hints */}
        <div className="lg:col-span-4 space-y-10">

          {/* Recent Events */}
          <section className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">События</h2>
            </div>
            <div className="space-y-6">
              {events.length === 0 && (
                <div className="text-center py-4 text-t3 text-[12px] italic">Событий пока нет</div>
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

                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full block ${dotColor}`}></span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] text-t1 leading-relaxed">{act.message}</div>
                      <div className="text-[11px] text-t3 mt-0.5 font-medium">{timeStr}</div>
                    </div>
                  </div>
                );
              })}
              {events.length > 5 && (
                <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="text-[11px] font-bold text-accent hover:underline uppercase tracking-widest pt-2"
                >
                    {showAllEvents ? 'Свернуть' : `Показать все (${events.length})`}
                </button>
              )}
            </div>
          </section>

          {/* Hint Card */}
          {showHint && (
            <div className="p-5 rounded-2xl bg-surface border border-border-light relative group overflow-hidden shadow-sh-sm">
              <button
                onClick={() => setShowHint(false)}
                className="absolute top-3 right-3 text-t3 hover:text-t1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconX size={14} stroke={2} />
              </button>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-accent/5 flex items-center justify-center shrink-0 text-accent border border-accent/10">
                  <IconBulb size={18} stroke={1.5} />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-t1">Совет дня</div>
                  <p className="text-[12.5px] text-t2 mt-1 leading-relaxed">
                    Заполните заблокированные часы на следующую неделю для личного времени.
                  </p>
                  <button className="mt-3 text-accent text-[12px] font-bold hover:underline">
                    Настроить график
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up border border-border">
                <div className="text-[16px] font-bold text-t1 mb-2 tracking-tight">Отклонить заявку?</div>
                <p className="text-[13px] text-t3 mb-6 leading-relaxed">Вы можете просто отклонить запись или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => handleReject(rejectingId, true)}
                        className="w-full bg-accent text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => handleReject(rejectingId, false)}
                        className="w-full bg-bg-custom text-red-custom py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-custom/10 transition-all"
                    >
                        Отклонить без переноса
                    </button>
                    <button
                        onClick={() => setRejectingId(null)}
                        className="w-full py-2.5 text-t3 text-[13px] font-bold hover:text-t1 transition-all"
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
