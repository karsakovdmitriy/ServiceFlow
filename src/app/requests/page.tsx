'use client';

import React, { useState, useMemo } from 'react';
import { IconCalendar, IconCheck, IconX, IconSearch, IconFilter } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function RequestsPage() {
  const { requests, sessions, completedSessions, approveRequest, rejectRequest, cancelSession, completeSession } = useStore();
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleReject = (id: string, reschedule: boolean) => {
    rejectRequest(id, reschedule);
    setRejectingId(null);
  };

  const handleCancel = (id: string, reschedule: boolean) => {
    // We'll reuse rejectRequest logic for cancellation with notification if needed,
    // or we can just call cancelSession. The prompt says ask for reschedule.
    if (reschedule) {
        rejectRequest(id, true); // This will set status to rejected and notify
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
    <div className="animate-fade-up">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] self-start sm:self-center">Управление записями</div>
        <div className="relative w-full sm:w-64">
           <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
           <input
              type="text"
              placeholder="Поиск по клиенту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border-light rounded-xl text-[13px] outline-none focus:border-accent transition-all"
           />
        </div>
      </div>

      <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-3">Ожидают подтверждения</div>
      <div className="card mb-8">
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-t3 text-[13px]">
            {search ? 'Ничего не найдено' : 'Нет новых заявок'}
          </div>
        )}
        {filteredRequests.map((req, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-border-light last:border-none last:pb-0 first:pt-0">
            <div className="w-[42px] h-[42px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm">
              {req.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-t1 tracking-tight">{req.name}</div>
              <div className="text-[12px] text-t3 mt-1 flex items-center gap-1.5 font-medium">
                <IconCalendar size={13} className="text-accent" /> {req.date} · {req.time}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approveRequest(req.id)}
                className="bg-green-custom text-white text-[12px] font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-all shadow-md shadow-green-500/10 active:scale-95"
              >
                Принять
              </button>
              <button
                onClick={() => setRejectingId(req.id)}
                className="bg-red-light text-red-custom border border-red-200 text-[12px] font-bold px-4 py-2 rounded-xl hover:bg-red-custom hover:text-white transition-all active:scale-95"
              >
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-3">Предстоящие</div>
          <div className="space-y-4">
            {filteredSessions.length === 0 && (
              <div className="card text-center py-8 text-t3 text-[13px]">Нет активных записей</div>
            )}
            {groupedSessions.map(([date, items]) => (
              <div key={date} className="space-y-2">
                <div className="text-[11px] font-bold text-accent px-1 flex items-center gap-2">
                   <div className="h-px bg-accent/20 flex-1"></div>
                   {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
                   <div className="h-px bg-accent/20 flex-1"></div>
                </div>
                <div className="card !p-0 overflow-hidden">
                  {items.map((session, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-border-light last:border-none hover:bg-bg-custom/50 transition-colors">
                      <div className="w-[38px] h-[38px] rounded-full bg-blue-light text-blue-custom flex items-center justify-center text-[12px] font-bold shrink-0">
                        {session.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-t1">{session.name}</div>
                        <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5">
                          <IconCalendar size={13} className="opacity-70" /> {session.time}
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                          <button
                            onClick={() => completeSession(session.id)}
                            className="w-8 h-8 flex items-center justify-center text-green-custom hover:bg-green-light rounded-lg transition-all"
                            title="Завершить"
                          >
                            <IconCheck size={18} />
                          </button>
                          <button
                            onClick={() => setCancellingId(session.id)}
                            className="w-8 h-8 flex items-center justify-center text-t3 hover:text-red-custom hover:bg-red-light rounded-lg transition-all"
                            title="Отменить"
                          >
                            <IconX size={18} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-3">Завершенные</div>
          <div className="card opacity-80">
            {completedSessions.length === 0 && (
              <div className="text-center py-6 text-t3 text-[13px]">Нет завершенных записей</div>
            )}
            {completedSessions.map((session, i) => (
              <div key={i} className="flex items-center gap-3 py-3.5 border-b border-border-light last:border-none last:pb-0 first:pt-0">
                <div className="w-[38px] h-[38px] rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[12px] font-bold shrink-0">
                  {session.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-t1">{session.name}</div>
                  <div className="text-[11px] text-t3 mt-0.5">
                    {session.date} · {session.time}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-tight">завершено</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {(rejectingId || cancellingId) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
                <div className="text-[16px] font-bold text-t1 mb-2">{rejectingId ? 'Отклонить заявку?' : 'Отменить тренировку?'}</div>
                <p className="text-[13px] text-t3 mb-6">Вы можете просто {rejectingId ? 'отклонить запись' : 'отменить тренировку'} или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, true) : handleCancel(cancellingId!, true)}
                        className="w-full bg-accent text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => rejectingId ? handleReject(rejectingId, false) : handleCancel(cancellingId!, false)}
                        className="w-full bg-red-custom text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-600 transition-all"
                    >
                        {rejectingId ? 'Отклонить без переноса' : 'Отменить без переноса'}
                    </button>
                    <button
                        onClick={() => { setRejectingId(null); setCancellingId(null); }}
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
