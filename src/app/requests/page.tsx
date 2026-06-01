'use client';

import React, { useState, useMemo } from 'react';
import { IconCalendar, IconCheck, IconX, IconSearch, IconChevronRight, IconClock, IconHistory, IconCalendarTime } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function RequestsPage() {
  const { requests, sessions, completedSessions, approveRequest, rejectRequest, cancelSession, completeSession } = useStore();
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const handleReject = (id: string, reschedule: boolean) => {
    rejectRequest(id, reschedule);
    setRejectingId(null);
  };

  const handleCancel = (id: string, reschedule: boolean) => {
    if (reschedule) {
        rejectRequest(id, true);
    } else {
        cancelSession(id);
    }
    setCancellingId(null);
  };

  const groupSessionsByDay = (list: any[]) => {
    const groups: { [key: string]: any[] } = {};
    list.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [requests, search]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const overdueSessions = useMemo(() => {
    return sessions.filter(s => s.date < todayStr && s.name.toLowerCase().includes(search.toLowerCase()));
  }, [sessions, search, todayStr]);

  const filteredUpcomingSessions = useMemo(() => {
    const upcoming = sessions.filter(s => s.date >= todayStr && s.name.toLowerCase().includes(search.toLowerCase()));

    if (showAllUpcoming) return upcoming;

    // Filter for current week (Mon-Sun)
    const curr = new Date();
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    return upcoming.filter(s => {
      const d = new Date(s.date);
      return d >= monday && d <= sunday;
    });
  }, [sessions, search, todayStr, showAllUpcoming]);

  const groupedUpcomingSessions = useMemo(() => groupSessionsByDay(filteredUpcomingSessions), [filteredUpcomingSessions]);

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto space-y-16">
      {/* Header & Tabs - minimalist search and tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex bg-bg-custom p-1 rounded-xl">
           <button
             onClick={() => setActiveTab('active')}
             className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-surface text-t1' : 'text-t3 hover:text-t2'}`}
           >
             <IconCalendarTime size={16} stroke={2} /> АКТИВНЫЕ
           </button>
           <button
             onClick={() => setActiveTab('completed')}
             className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-surface text-t1' : 'text-t3 hover:text-t2'}`}
           >
             <IconHistory size={16} stroke={2} /> ИСТОРИЯ
           </button>
        </div>
        <div className="relative w-full md:w-64">
           <IconSearch size={16} stroke={2} className="absolute left-0 top-1/2 -translate-y-1/2 text-t3 opacity-50" />
           <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-0 py-2 bg-transparent border-b border-border rounded-none text-[14px] font-medium outline-none focus:border-accent transition-all"
           />
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className="space-y-24">
          {/* Section: Overdue Sessions */}
          {overdueSessions.length > 0 && (
            <section className="bg-red-50/10 p-8 rounded-3xl border-none">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-bold text-red-custom uppercase tracking-widest flex items-center gap-2">
                   ПРОСРОЧЕННЫЕ
                </h2>
                <span className="text-[10px] font-bold text-red-custom/40 uppercase tracking-widest">{overdueSessions.length} ЗАПИСЕЙ</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {overdueSessions.map((session, i) => (
                  <div key={i} className="group relative bg-surface p-6 rounded-3xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-custom flex items-center justify-center text-[12px] font-bold shrink-0">
                          {session.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="text-[15px] font-bold text-t1 tracking-tight">{session.name}</div>
                          <div className="text-[12px] text-red-custom/60 font-bold flex items-center gap-2 mt-0.5">
                              <IconCalendar size={13} stroke={2} /> {session.date} · {session.time}
                          </div>
                      </div>
                      <div className="flex gap-2 mgmt-icon">
                          <button
                              onClick={() => completeSession(session.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-green-custom hover:bg-green-50 transition-all"
                              title="Завершить"
                          >
                              <IconCheck size={18} stroke={2} />
                          </button>
                          <button
                              onClick={() => setCancellingId(session.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-t3 hover:text-red-custom hover:bg-red-50 transition-all"
                              title="Отменить"
                          >
                              <IconX size={18} stroke={2} />
                          </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Pending Confirmation */}
          {filteredRequests.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">ОЖИДАЮТ ПОДТВЕРЖДЕНИЯ</h2>
                <span className="text-[10px] font-bold text-accent tracking-widest uppercase">{filteredRequests.length} ЗАЯВОК</span>
              </div>
              <div className="space-y-4">
                {filteredRequests.map((req, i) => (
                  <div key={i} className="group flex items-center gap-6 py-4 border-b border-border-light last:border-0 hover:bg-bg-custom/50 rounded-xl px-4 -mx-4 transition-all">
                    <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-[12px] font-bold text-accent shrink-0">
                      {req.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-t1 tracking-tight">{req.name}</div>
                      <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-2 font-bold uppercase tracking-tighter">
                        <IconClock size={13} stroke={2} className="text-accent opacity-50" /> {req.date} · {req.time}
                      </div>
                    </div>
                    <div className="flex gap-2 mgmt-icon">
                      <button
                        onClick={() => approveRequest(req.id)}
                        className="bg-green-custom text-white text-[11px] font-bold px-5 py-2 rounded-xl hover:bg-green-600 transition-all active:scale-95"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => setRejectingId(req.id)}
                        className="text-red-custom text-[11px] font-bold px-5 py-2 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Upcoming (Timeline style) */}
          <section>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">
                {showAllUpcoming ? 'ПРЕДСТОЯЩИЕ (ВСЕ)' : 'НА ЭТУ НЕДЕЛЮ'}
              </h2>
              {!showAllUpcoming && sessions.length > filteredUpcomingSessions.length && (
                <button
                    onClick={() => setShowAllUpcoming(true)}
                    className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
                >
                    РАЗВЕРНУТЬ ВСЕ
                </button>
              )}
            </div>

            {filteredUpcomingSessions.length === 0 ? (
              <div className="text-center py-24 bg-surface rounded-[40px] border-none">
                <div className="text-[13px] text-t3 font-bold opacity-40 italic">На эту неделю записей нет</div>
              </div>
            ) : (
              <div className="relative pl-8 border-l-2 border-border-light space-y-16 ml-2">
                {groupedUpcomingSessions.map(([date, items]) => (
                  <div key={date} className="relative">
                    {/* Day Marker */}
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-surface border-4 border-accent"></div>
                    <div className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] mb-8">
                      {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {items.map((session, i) => (
                        <div key={i} className="group relative bg-surface p-6 rounded-[32px] transition-all hover:bg-bg-custom/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-bg-custom text-t2 flex items-center justify-center text-[12px] font-bold shrink-0">
                                {session.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[15px] font-bold text-t1 tracking-tight">{session.name}</div>
                                <div className="text-[12px] text-t3 font-bold flex items-center gap-2 mt-0.5">
                                    <IconClock size={13} stroke={2} className="opacity-40" /> {session.time}
                                </div>
                            </div>
                            <div className="flex gap-2 mgmt-icon">
                                <button
                                    onClick={() => completeSession(session.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-green-custom hover:bg-green-50 transition-all"
                                >
                                    <IconCheck size={20} stroke={2} />
                                </button>
                                <button
                                    onClick={() => setCancellingId(session.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-t3 hover:text-red-custom hover:bg-red-50 transition-all"
                                >
                                    <IconX size={20} stroke={2} />
                                </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Completed Sessions History */
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Завершенные записи</h2>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          <div className="space-y-1">
            {completedSessions.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-[13px] text-t3 font-medium">
                Нет завершенных записей
              </div>
            ) : (
              completedSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white transition-all opacity-70">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-t3 flex items-center justify-center text-[11px] font-bold shrink-0">
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-t1">{session.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 font-medium">
                      {session.date} · {session.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-t3 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">
                     <IconCheck size={12} stroke={3} /> Завершено
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Reject/Cancel Modal - Full Viewport */}
      {(rejectingId || cancellingId) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-surface rounded-[40px] p-10 max-w-sm w-full animate-fade-up border-none">
                <div className="text-[18px] font-bold text-t1 mb-3 tracking-tight">{rejectingId ? 'Отклонить заявку?' : 'Отменить тренировку?'}</div>
                <p className="text-[14px] text-t3 mb-10 leading-relaxed font-medium">Вы можете просто {rejectingId ? 'отклонить запись' : 'отменить тренировку'} или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, true) : handleCancel(cancellingId!, true)}
                        className="w-full bg-accent text-white py-4 rounded-2xl text-[14px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, false) : handleCancel(cancellingId!, false)}
                        className="w-full bg-bg-custom text-red-custom py-4 rounded-2xl text-[14px] font-bold hover:bg-red-50 transition-all"
                    >
                        {rejectingId ? 'Отклонить без переноса' : 'Отменить без переноса'}
                    </button>
                    <button
                        onClick={() => { setRejectingId(null); setCancellingId(null); }}
                        className="w-full py-4 text-t3 text-[14px] font-bold hover:text-t1 transition-all"
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
