'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconCheck, IconX, IconArrowRight, IconUser, IconCalendar } from '@tabler/icons-react';

export default function VenueRequests() {
  const { requests, venueStaff, approveRequest, rejectRequest } = useStore();
  const [distributingId, setDistributingId] = useState<string | null>(null);

  const handleAssign = (requestId: string, trainerId: string) => {
    // In a real app, we would update the session with the trainerId
    approveRequest(requestId);
    setDistributingId(null);
  };

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Заявки площадки</h1>
      <p className="text-t2 text-[14px]">Распределяйте входящие заявки между доступными мастерами или подтверждайте их напрямую.</p>

      <div className="space-y-4">
        {requests.length === 0 && (
          <div className="py-20 text-center text-t3 text-[14px] bg-surface rounded-2xl border border-dashed border-border">
              Новых заявок для распределения нет
          </div>
        )}
        {requests.map((req) => (
          <div key={req.id} className="bg-surface p-6 rounded-2xl border border-border-light shadow-sh-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent font-bold">
                  {req.initials}
                </div>
                <div>
                  <div className="text-[16px] font-bold text-t1">{req.name}</div>
                  <div className="text-[13px] text-t3 flex items-center gap-2">
                    <IconCalendar size={14} /> {req.date} · {req.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDistributingId(req.id)}
                  className="bg-accent text-white px-5 py-2 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all flex items-center gap-2"
                >
                  <IconArrowRight size={16} />
                  Назначить мастера
                </button>
                <button
                  onClick={() => rejectRequest(req.id)}
                  className="p-2 text-t3 hover:text-red-custom transition-all"
                >
                  <IconX size={20} />
                </button>
              </div>
            </div>

            {distributingId === req.id && (
              <div className="pt-6 border-t border-border-light animate-fade-down">
                <div className="text-[12px] font-bold text-t3 uppercase tracking-wider mb-4">Выберите мастера для этой записи:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {venueStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => handleAssign(req.id, staff.trainer_id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-bg-custom border border-border-light hover:border-accent transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent">
                        {(staff.trainer_name || 'M').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-bold text-t1">{staff.trainer_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
