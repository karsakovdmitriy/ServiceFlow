'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconClock, IconCalendar, IconCheck, IconSettings } from '@tabler/icons-react';

export default function VenueSchedule() {
  const { schedule, toggleDay, updateScheduleTime } = useStore();

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-t1">Расписание площадки</h1>
        <div className="flex items-center gap-2 text-t3 text-[13px]">
            <IconSettings size={18} />
            <span>Настройка рабочих часов локации</span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border-light shadow-sh-sm overflow-hidden">
        <div className="divide-y divide-border-light">
          {schedule.map((day, idx) => (
            <div key={day.name} className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-4 ${!day.on ? 'bg-bg-custom/30' : ''}`}>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => toggleDay(idx)}
                  className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${day.on ? 'bg-green-custom' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.on ? 'left-6' : 'left-1'}`} />
                </button>
                <div>
                  <div className="text-[15px] font-bold text-t1 leading-tight">{day.name}</div>
                  <div className="text-[11px] text-t3 uppercase font-bold tracking-wider mt-0.5">{day.on ? 'Работает' : 'Выходной'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                {day.on ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-bg-custom border border-border-light rounded-xl px-3 py-1.5">
                      <IconClock size={14} className="text-t3" />
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateScheduleTime(idx, e.target.value, day.endTime)}
                        className="bg-transparent border-none text-[14px] font-bold text-t1 focus:outline-none w-14"
                      />
                    </div>
                    <span className="text-t3 font-bold">—</span>
                    <div className="flex items-center gap-1.5 bg-bg-custom border border-border-light rounded-xl px-3 py-1.5">
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateScheduleTime(idx, day.startTime, e.target.value)}
                        className="bg-transparent border-none text-[14px] font-bold text-t1 focus:outline-none w-14"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] text-t3 italic py-1.5">Закрыто</div>
                )}

                <div className="hidden md:block">
                  {day.on && <IconCheck size={20} className="text-green-custom" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-t3 text-center">
        Рабочие часы площадки ограничивают доступное время для записи всех мастеров, работающих на этой локации.
      </p>
    </div>
  );
}
