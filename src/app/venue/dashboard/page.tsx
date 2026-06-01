'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconUsers, IconCalendarEvent, IconActivity } from '@tabler/icons-react';

export default function VenueDashboard() {
  const { venues, sessions, venueStaff, schedule } = useStore();
  const currentVenue = venues[0];

  const occupancyRate = React.useMemo(() => {
    const totalWorkingHours = schedule.filter(d => d.on).length * 10; // Simple estimate
    if (totalWorkingHours === 0) return 0;
    const occupiedHours = sessions.filter(s => s.status === 'confirmed').length;
    return Math.min(Math.round((occupiedHours / totalWorkingHours) * 100), 100);
  }, [schedule, sessions]);

  return (
    <div className="animate-fade-up max-w-[1100px] mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-t1">Обзор площадки: {currentVenue?.name || 'Загрузка...'}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <IconUsers size={24} />
          </div>
          <div>
            <div className="text-[11px] text-t3 font-bold uppercase tracking-wider">Мастера</div>
            <div className="text-[24px] font-bold text-t1">{venueStaff.length}</div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <IconCalendarEvent size={24} />
          </div>
          <div>
            <div className="text-[11px] text-t3 font-bold uppercase tracking-wider">Записи</div>
            <div className="text-[24px] font-bold text-t1">{sessions.length}</div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <IconActivity size={24} />
          </div>
          <div>
            <div className="text-[11px] text-t3 font-bold uppercase tracking-wider">Загрузка</div>
            <div className="text-[24px] font-bold text-t1">{occupancyRate}%</div>
          </div>
        </div>
      </div>

      <section className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm">
        <h2 className="text-sm font-bold text-t1 uppercase tracking-wider mb-6">Последняя активность</h2>
        <div className="space-y-4">
          {sessions.length === 0 && (
             <div className="py-10 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                На площадке пока нет активных записей
             </div>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-custom transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-custom flex items-center justify-center text-[11px] font-bold text-t2 border border-surface">
                  {s.initials}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-t1">{s.name}</div>
                  <div className="text-[12px] text-t3">{s.service}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-medium text-t1">{s.time}</div>
                <div className="text-[11px] text-t3">{s.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
