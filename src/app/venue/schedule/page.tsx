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
            <div key={day.name} className={`p-6 flex items-center justify-between transition-all ${!day.on ? 'bg-bg-custom/30' : ''}`}>
              <div className="flex items-center gap-6 min-w-[200px]">
                <button
                  onClick={() => toggleDay(idx)}
                  className={`w-12 h-6 rounded-full transition-all relative ${day.on ? 'bg-green-custom' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.on ? 'left-7' : 'left-1'}`} />
                </button>
                <div>
                  <div className="text-[15px] font-bold text-t1">{day.name}</div>
                  <div className="text-[12px] text-t3">{day.on ? 'Работает' : 'Выходной'}</div>
                </div>
              </div>

              {day.on ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <IconClock size={16} className="text-t3" />
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateScheduleTime(idx, e.target.value, day.endTime)}
                      className="bg-bg-custom border border-border-light rounded-lg px-2 py-1 text-[14px] focus:outline-none"
                    />
                  </div>
                  <span className="text-t3">—</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateScheduleTime(idx, day.startTime, e.target.value)}
                      className="bg-bg-custom border border-border-light rounded-lg px-2 py-1 text-[14px] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-t3 italic">Весь день закрыто</div>
              )}

              <div className="hidden md:block">
                {day.on && <IconCheck size={20} className="text-green-custom" />}
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
