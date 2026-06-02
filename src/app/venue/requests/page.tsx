'use client';

import React, { useState, useMemo } from 'react';
import {
  IconCalendar,
  IconCheck,
  IconX,
  IconSearch,
  IconClock,
  IconHistory,
  IconCalendarTime,
  IconArrowRight
} from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function VenueRequests() {
  const { requests, sessions, completedSessions, venueStaff, approveRequest, rejectRequest, cancelSession, completeSession } = useStore();
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [distributingId, setDistributingId] = useState<string | null>(null);
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

  const handleAssign = (requestId: string, trainerId: string) => {
    approveRequest(requestId, trainerId);
    setDistributingId(null);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [requests, search]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [sessions, search]);

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex bg-bg-custom p-1 rounded-xl border border-border">
           <button
             onClick={() => setActiveTab('active')}
             className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-surface text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
           >
             <IconCalendarTime size={16} /> Текущие
           </button>
           <button
             onClick={() => setActiveTab('completed')}
             className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-surface text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
           >
             <IconHistory size={16} /> История
           </button>
        </div>
        <div className="relative w-full md:w-72">
           <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
           <input
              type="text"
              placeholder="Поиск по клиенту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-[13px] font-medium outline-none focus:border-accent"
           />
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className="space-y-16">
          {/* New Requests Section */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Новые заявки</h2>
              <div className="h-px bg-border flex-1"></div>
            </div>
            <div className="space-y-3">
              {filteredRequests.length === 0 && (
                <div className="py-12 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                  Нет новых заявок
                </div>
              )}
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-surface p-5 rounded-2xl border border-border-light shadow-sh-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-accent font-bold">
                        {req.initials}
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-t1">{req.name}</div>
                        <div className="text-[12px] text-t3">{req.date} · {req.time}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDistributingId(distributingId === req.id ? null : req.id)}
                        className="bg-accent text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-accent-hover transition-all flex items-center gap-1.5 shadow-lg shadow-accent/10 active:scale-95"
                      >
                        <IconArrowRight size={14} /> Назначить
                      </button>
                      <button onClick={() => setRejectingId(req.id)} className="text-red-custom text-[12px] font-bold px-4 py-1.5 rounded-lg hover:bg-red-50 transition-all active:scale-95">
                        Отклонить
                      </button>
                    </div>
                  </div>

                  {distributingId === req.id && (
                    <div className="pt-4 border-t border-border-light grid grid-cols-2 md:grid-cols-4 gap-2 animate-fade-down">
                      {venueStaff.map(staff => (
                        <button
                          key={staff.id}
                          onClick={() => handleAssign(req.id, staff.trainer_id)}
                          className="px-3 py-2 rounded-lg bg-bg-custom border border-border-light text-[11px] font-bold text-t2 hover:border-accent text-left transition-all"
                        >
                          {staff.trainer_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Active Sessions Section */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Предстоящие тренировки</h2>
              <div className="h-px bg-border flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="group flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light hover:shadow-sh-sm transition-all gap-4">
                  <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-bg-custom flex items-center justify-center text-[11px] font-bold text-t2 shrink-0">
                      {session.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-t1 truncate">{session.name}</div>
                      <div className="text-[11px] text-t3 whitespace-nowrap overflow-hidden text-ellipsis">{session.date} · {session.time}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => completeSession(session.id)} className="w-8 h-8 flex items-center justify-center text-green-custom hover:bg-green-50 rounded-lg transition-colors">
                      <IconCheck size={18} stroke={2} />
                    </button>
                    <button onClick={() => setCancellingId(session.id)} className="w-8 h-8 flex items-center justify-center text-t3 hover:text-red-custom hover:bg-red-50 rounded-lg transition-colors">
                      <IconX size={18} stroke={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <section>
          <div className="space-y-1">
            {completedSessions.length === 0 ? (
              <div className="py-20 text-center text-t3 text-[14px] italic bg-bg-custom/50 rounded-2xl border border-dashed border-border">История пуста</div>
            ) : (
              completedSessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-bg-custom/50 transition-colors opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-bg-custom flex items-center justify-center text-[10px] font-bold">{s.initials}</div>
                    <div>
                      <div className="text-[14px] font-medium text-t1">{s.name}</div>
                      <div className="text-[11px] text-t3">{s.date} · {s.time}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-t3 uppercase tracking-widest px-2 py-1 bg-bg-custom rounded-full">Завершено</div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Modals */}
      {(rejectingId || cancellingId) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up border border-border">
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
        </div>
      )}
    </div>
  );
}
