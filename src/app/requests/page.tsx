'use client';

import React, { useState, useMemo } from 'react';
import { IconCalendar, IconCheck, IconX, IconSearch, IconChevronRight, IconClock, IconHistory, IconCalendarTime, IconBellRinging } from '@tabler/icons-react';
import { useStore } from '@/lib/store';
import PortalModal from '@/components/PortalModal';

export default function RequestsPage() {
  const { requests, sessions, completedSessions, approveRequest, rejectRequest, cancelSession, completeSession, sendReminder } = useStore();
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [remindingId, setRemindingId] = React.useState<string | null>(null);

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

  const handleSendReminder = async (id: string) => {
    setRemindingId(id);
    await sendReminder(id);
    setTimeout(() => setRemindingId(null), 2000);
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
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex bg-bg-custom p-1 rounded-xl border border-border">
           <button
             onClick={() => setActiveTab('active')}
             className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-surface text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
           >
             <IconCalendarTime size={16} /> Активные
           </button>
           <button
             onClick={() => setActiveTab('completed')}
             className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-surface text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
           >
             <IconHistory size={16} /> История
           </button>
        </div>
        <div className="relative w-full md:w-72">
           <IconSearch size={16} stroke={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
           <input
              type="text"
              placeholder="Поиск по клиенту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-[13px] font-medium outline-none focus:border-accent transition-all shadow-sm text-t1"
           />
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className="space-y-16">
          {/* Section: Overdue Sessions */}
          {overdueSessions.length > 0 && (
            <section className="bg-red-custom/5 p-6 rounded-r-xl border border-red-custom/10">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[14px] font-bold text-red-custom uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                  <IconCalendarTime size={18} /> Просроченые записи
                </h2>
                <div className="h-px bg-red-custom/10 flex-1"></div>
                <span className="text-[11px] font-bold text-red-custom/60 uppercase">{overdueSessions.length} записей</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overdueSessions.map((session, i) => (
                  <div key={i} className="group relative bg-surface p-4 rounded-2xl border border-red-custom/10 hover:shadow-sh-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-custom/10 flex items-center justify-center text-[11px] font-bold text-red-custom shrink-0">
                          {session.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-bold text-t1">{session.name}</div>
                          <div className="text-[12px] text-red-custom/70 font-medium flex items-center gap-1">
                              <IconCalendar size={12} stroke={2} /> {session.date} · {session.time}
                          </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Ожидают подтверждения</h2>
                <div className="h-px bg-border flex-1"></div>
              </div>
              <div className="space-y-1">
                {filteredRequests.map((req, i) => (
                  <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-surface transition-all">
                    <div className="w-11 h-11 rounded-full bg-accent/5 flex items-center justify-center text-[12px] font-bold text-accent shrink-0 border border-border">
                      {req.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-t1 tracking-tight">{req.name}</div>
                      <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5 font-medium">
                        <IconClock size={13} stroke={2} className="text-accent" /> {req.date} · {req.time}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => approveRequest(req.id)}
                        className="bg-green-custom text-white text-[12px] font-bold px-5 py-2 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/10 active:scale-95"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => setRejectingId(req.id)}
                        className="text-red-custom text-[12px] font-bold px-5 py-2 rounded-xl hover:bg-red-50 transition-all active:scale-95"
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
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">
                {showAllUpcoming ? 'Все предстоящие записи' : 'Записи на эту неделю'}
              </h2>
              <div className="h-px bg-border flex-1"></div>
              {!showAllUpcoming && sessions.length > filteredUpcomingSessions.length && (
                <button
                    onClick={() => setShowAllUpcoming(true)}
                    className="text-[11px] font-bold text-accent hover:underline uppercase tracking-widest"
                >
                    Развернуть все
                </button>
              )}
            </div>

            {filteredUpcomingSessions.length === 0 ? (
              <div className="text-center py-20 bg-bg-custom rounded-3xl border border-dashed border-border">
                <div className="text-[13px] text-t3 font-medium">Предстоящих записей на эту неделю нет</div>
                <button
                  onClick={() => setShowAllUpcoming(true)}
                  className="mt-4 text-[12px] font-bold text-accent hover:underline"
                >
                  Показать все записи
                </button>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-border space-y-10">
                {groupedUpcomingSessions.map(([date, items]) => (
                  <div key={date} className="relative">
                    {/* Day Marker */}
                    <div className="absolute -left-[31px] top-0 w-2.5 h-2.5 rounded-full bg-accent border-[2.5px] border-bg-custom shadow-[0_0_0_4px_var(--surface)]"></div>
                    <div className="text-[12px] font-bold text-accent uppercase tracking-widest mb-4">
                      {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((session, i) => (
                        <div key={i} className="group relative bg-surface p-4 rounded-2xl border border-border hover:shadow-sh-md hover:-translate-y-0.5 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-bg-custom flex items-center justify-center text-[11px] font-bold text-t2 shrink-0">
                                {session.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-bold text-t1">{session.name}</div>
                                <div className="text-[12px] text-t3 font-medium flex items-center gap-1">
                                    <IconClock size={12} stroke={2} /> {session.time}
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                                <button
                                    onClick={() => handleSendReminder(session.id)}
                                    disabled={remindingId === session.id}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                        remindingId === session.id ? 'text-green-custom bg-green-50' : 'text-t3 hover:text-accent hover:bg-accent/5'
                                    }`}
                                    title="Напомнить"
                                >
                                    {remindingId === session.id ? <IconCheck size={16} /> : <IconBellRinging size={16} />}
                                </button>
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
            <div className="h-px bg-border flex-1"></div>
          </div>
          <div className="space-y-1">
            {completedSessions.length === 0 ? (
              <div className="text-center py-20 bg-bg-custom/50 rounded-3xl border border-dashed border-border text-[13px] text-t3 font-medium">
                Нет завершенных записей
              </div>
            ) : (
              completedSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface transition-all opacity-70">
                  <div className="w-10 h-10 rounded-full bg-bg-custom text-t3 flex items-center justify-center text-[11px] font-bold shrink-0">
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-t1">{session.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 font-medium">
                      {session.date} · {session.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-t3 uppercase tracking-widest bg-bg-custom px-2 py-1 rounded-full border border-border">
                     <IconCheck size={12} stroke={3} /> Завершено
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Reject/Cancel Modal */}
      <PortalModal isOpen={!!(rejectingId || cancellingId)} onClose={() => { setRejectingId(null); setCancellingId(null); }}>
            <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up border border-border">
                <div className="text-[16px] font-bold text-t1 mb-2 tracking-tight">{rejectingId ? 'Отклонить заявку?' : 'Отменить запись?'}</div>
                <p className="text-[13px] text-t3 mb-6 leading-relaxed">Вы можете просто {rejectingId ? 'отклонить запись' : 'отменить визит'} или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, true) : handleCancel(cancellingId!, true)}
                        className="w-full bg-accent text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, false) : handleCancel(cancellingId!, false)}
                        className="w-full bg-bg-custom text-red-custom py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-custom/10 transition-all"
                    >
                        {rejectingId ? 'Отклонить без переноса' : 'Отменить без переноса'}
                    </button>
                    <button
                        onClick={() => { setRejectingId(null); setCancellingId(null); }}
                        className="w-full py-2.5 text-t3 text-[13px] font-bold hover:text-t1 transition-all"
                    >
                        Отмена
                    </button>
                </div>
            </div>
      </PortalModal>
    </div>
  );
}
