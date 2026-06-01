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

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [sessions, search]);

  const groupedSessions = useMemo(() => groupSessionsByDay(filteredSessions), [filteredSessions]);

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button
             onClick={() => setActiveTab('active')}
             className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-white text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
           >
             <IconCalendarTime size={16} /> Активные
           </button>
           <button
             onClick={() => setActiveTab('completed')}
             className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-white text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[13px] font-medium outline-none focus:border-accent transition-all shadow-sm"
           />
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className="space-y-12">
          {/* Section: Pending Confirmation */}
          {filteredRequests.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Ожидают подтверждения</h2>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <div className="space-y-1">
                {filteredRequests.map((req, i) => (
                  <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white transition-all">
                    <div className="w-11 h-11 rounded-full bg-accent/5 flex items-center justify-center text-[12px] font-bold text-accent shrink-0 border border-white">
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
              <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Предстоящие записи</h2>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-[13px] text-t3 font-medium">Активных записей не найдено</div>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-slate-100 space-y-10">
                {groupedSessions.map(([date, items]) => (
                  <div key={date} className="relative">
                    {/* Day Marker */}
                    <div className="absolute -left-[31px] top-0 w-2.5 h-2.5 rounded-full bg-accent border-[2.5px] border-slate-50 shadow-[0_0_0_4px_white]"></div>
                    <div className="text-[12px] font-bold text-accent uppercase tracking-widest mb-4">
                      {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((session, i) => (
                        <div key={i} className="group relative bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-sh-md hover:-translate-y-0.5 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[11px] font-bold text-t2 shrink-0">
                                {session.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-bold text-t1">{session.name}</div>
                                <div className="text-[12px] text-t3 font-medium flex items-center gap-1">
                                    <IconClock size={12} stroke={2} /> {session.time}
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

      {/* Reject/Cancel Modal */}
      {(rejectingId || cancellingId) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up border border-slate-100">
                <div className="text-[16px] font-bold text-t1 mb-2 tracking-tight">{rejectingId ? 'Отклонить заявку?' : 'Отменить тренировку?'}</div>
                <p className="text-[13px] text-t3 mb-6 leading-relaxed">Вы можете просто {rejectingId ? 'отклонить запись' : 'отменить тренировку'} или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, true) : handleCancel(cancellingId!, true)}
                        className="w-full bg-accent text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, false) : handleCancel(cancellingId!, false)}
                        className="w-full bg-slate-50 text-red-custom py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-50 transition-all"
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
        </div>
      )}
    </div>
  );
}
