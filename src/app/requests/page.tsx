'use client';

import React from 'react';
import { IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function RequestsPage() {
  const { requests, sessions, completedSessions, approveRequest, rejectRequest, cancelSession, completeSession } = useStore();

  return (
    <div className="animate-fade-up">
      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Ожидают подтверждения</div>
      <div className="card mb-6">
        {requests.length === 0 && (
          <div className="text-center py-8 text-t3 text-[13px] border-2 border-dashed border-border-light rounded-r-lg">
            Нет новых заявок от клиентов
          </div>
        )}
        {requests.map((req, i) => (
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
                onClick={() => rejectRequest(req.id)}
                className="bg-red-light text-red-custom border border-red-200 text-[12px] font-bold px-4 py-2 rounded-xl hover:bg-red-custom hover:text-white transition-all active:scale-95"
              >
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Предстоящие записи</div>
          <div className="card">
            {sessions.length === 0 && (
              <div className="text-center py-6 text-t3 text-[13px]">Нет активных записей</div>
            )}
            {sessions.map((session, i) => (
              <div key={i} className="flex items-center gap-3 py-3.5 border-b border-border-light last:border-none last:pb-0 first:pt-0">
                <div className="w-[38px] h-[38px] rounded-full bg-blue-light text-blue-custom flex items-center justify-center text-[12px] font-bold shrink-0">
                  {session.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-t1">{session.name}</div>
                  <div className="text-[11px] text-t3 mt-0.5 flex items-center gap-1">
                    <IconCalendar size={11} /> {session.date} · {session.time}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                      onClick={() => completeSession(session.id)}
                      className="text-green-custom hover:bg-green-light p-1.5 rounded-lg transition-all"
                      title="Завершить"
                    >
                      <IconCheck size={18} />
                    </button>
                    <button
                      onClick={() => cancelSession(session.id)}
                      className="text-t3 hover:text-red-custom p-1.5 rounded-lg transition-all"
                      title="Отменить"
                    >
                      <IconX size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Завершенные</div>
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
    </div>
  );
}
