'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconUsers, IconCalendarEvent, IconActivity, IconClock } from '@tabler/icons-react';

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
      {/* Metrics Section (Overview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
        {[
          { label: 'Площадка', val: currentVenue?.name || 'Загрузка...', sub: 'Текущая' },
          { label: 'Мастера', val: venueStaff.length, sub: 'Активные' },
          { label: 'Записи', val: sessions.length, sub: 'Всего' },
          { label: 'Загрузка', val: occupancyRate + '%', sub: 'Общая', highlight: occupancyRate > 80 },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col px-4 first:pl-0 last:pr-0 border-r border-border-light last:border-r-0">
            <div className="text-[11px] text-t3 font-bold uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`text-[28px] font-bold tracking-tight leading-none truncate ${stat.highlight ? 'text-accent' : 'text-t1'}`}>
                {stat.val}
            </div>
            <div className="text-[11px] text-t3 mt-1.5 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Последняя активность</h2>
                <div className="h-px bg-border flex-1 mx-4"></div>
                <span className="text-[11px] font-bold text-t3">{sessions.length} записей</span>
            </div>
            <div className="space-y-1">
              {sessions.length === 0 && (
                <div className="py-10 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                    На площадке пока нет активных записей
                </div>
              )}
              {sessions.map((s, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-bg-custom transition-all">
                  <div className="w-10 h-10 rounded-full bg-bg-custom flex items-center justify-center text-[11px] font-bold text-t2 shrink-0 border border-surface">
                    {s.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-t1">{s.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5">
                      <IconClock size={12} stroke={1.5} /> {s.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium text-t1">{s.service}</div>
                    <div className="text-[11px] text-t3">{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-10">
          {/* Recent Events or other info can go here to match Master layout */}
          <div className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
             <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider mb-5">Информация</h2>
             <p className="text-[12px] text-t2 leading-relaxed">
               Управляйте мастерами и расписанием вашей площадки в соответствующих разделах.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
