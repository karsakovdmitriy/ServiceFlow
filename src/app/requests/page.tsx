'use client';

import React from 'react';
import { IconCalendar } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function RequestsPage() {
  const { requests, sessions, approveRequest, rejectRequest, cancelSession } = useStore();

  return (
    <div className="animate-fade-up">
      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Ожидают подтверждения</div>
      <div className="card mb-4">
        {requests.length === 0 && (
          <div className="text-center py-6 text-t3 text-[13px]">Нет новых заявок</div>
        )}
        {requests.map((req, i) => (
          <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
            <div className="w-[38px] h-[38px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[11.5px] font-bold shrink-0">
              {req.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-medium text-t1">{req.name}</div>
              <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
                <IconCalendar size={11} /> {req.time}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approveRequest(req.id)}
                className="bg-green-light text-green-custom border border-green-custom/20 text-[12px] font-medium px-3 py-1.5 rounded-r-sm hover:bg-green-custom hover:text-white transition-all"
              >
                Принять
              </button>
              <button
                onClick={() => rejectRequest(req.id)}
                className="bg-red-light text-red-custom border border-red-custom/20 text-[12px] font-medium px-3 py-1.5 rounded-r-sm hover:bg-red-custom hover:text-white transition-all"
              >
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Активные записи</div>
      <div className="card">
        {sessions.length === 0 && (
          <div className="text-center py-6 text-t3 text-[13px]">Нет активных записей</div>
        )}
        {sessions.map((session, i) => (
          <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[11.5px] font-bold shrink-0" style={{ backgroundColor: session.bg || '#EFF6FF', color: session.color || '#2563EB' }}>
              {session.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-medium text-t1">{session.name}</div>
              <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
                <IconCalendar size={11} /> {session.time}
              </div>
            </div>
            <div className="flex gap-2 items-center">
                <span className="text-[11px] font-semibold px-[10px] py-1 rounded-full bg-green-light text-green-custom">принято</span>
                <button
                  onClick={() => cancelSession(session.id)}
                  className="text-t3 hover:text-red-custom text-[11px] font-medium ml-2"
                >
                  Отменить
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
