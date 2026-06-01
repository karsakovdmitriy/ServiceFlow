'use client';

import React, { useState, useMemo } from 'react';
import { IconBan, IconX, IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useStore, Session, BlockedSlot, ScheduleDay } from '@/lib/store';

const DAYS_RU_SHORT = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const DAYS_RU_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export default function SchedulePage() {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const {
    schedule,
    blocks,
    sessions,
    toggleDay,
    updateScheduleTime,
    addBlock,
    removeBlock,
    profile
  } = useStore();

  const [newBlock, setNewBlock] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    allDay: false
  });

  const handleAddBlock = () => {
    addBlock(newBlock);
  };

  const formatBlock = (block: any) => {
    const d = new Date(block.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    return block.allDay ? `${d} · весь день` : `${d} · ${block.startTime}–${block.endTime}`;
  };

  // Weekly Overview Logic
  const { weekGrid, weekRangeLabel } = useMemo(() => {
    const curr = new Date();
    const day = curr.getDay(); // 0-6
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(curr.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const grid = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const dayOfWeek = date.getDay();
      const dayName = DAYS_RU_FULL[dayOfWeek];
      const dayShort = DAYS_RU_SHORT[dayOfWeek];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      const dayConfig = schedule.find(s => s.name === dayName);
      const slots = [];

      if (dayConfig && dayConfig.on) {
        const start = parseInt(dayConfig.startTime.split(':')[0]);
        const end = parseInt(dayConfig.endTime.split(':')[0]);

        for (let h = start; h < end; h++) {
          const timeStr = `${h.toString().padStart(2, '0')}:00`;

          const session = sessions.find(s => {
            if (s.date !== dateStr) return false;
            const [sStart] = s.time.split(' – ');
            return sStart === timeStr;
          });

          const isBlocked = blocks.some(b => {
            if (b.date !== dateStr) return false;
            if (b.allDay) return true;
            return timeStr >= b.startTime && timeStr < b.endTime;
          });

          slots.push({
            t: timeStr,
            s: session ? 'booked' : (isBlocked ? 'blocked' : 'free')
          });
        }
      } else {
        slots.push({ t: '—', s: 'blocked' });
      }

      grid.push({
        day: dayShort,
        dayName: dayName,
        dateLabel: date.getDate(),
        slots,
        today: isToday,
        fullDate: dateStr
      });
    }

    const lastDate = new Date(monday);
    lastDate.setDate(monday.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const rangeLabel = `${monday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${lastDate.toLocaleDateString('ru-RU', options)}`;

    return { weekGrid: grid, weekRangeLabel: rangeLabel };
  }, [schedule, sessions, blocks]);

  return (
    <div className="animate-fade-up max-w-[1200px] mx-auto space-y-10">

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Working Hours */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Рабочие часы</h2>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          <div className="space-y-1">
            {schedule.map((day, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white transition-all group">
                <div className="text-[13.5px] font-medium text-t1 w-24">{day.name}</div>
                <div className="flex-1 flex items-center gap-2">
                  {day.on ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateScheduleTime(i, e.target.value, day.endTime)}
                        className="text-[12px] font-semibold text-t2 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-accent/10"
                      />
                      <span className="text-t3 opacity-50">—</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateScheduleTime(i, day.startTime, e.target.value)}
                        className="text-[12px] font-semibold text-t2 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-accent/10"
                      />
                    </div>
                  ) : (
                    <div className="text-[12px] text-t3 italic">Выходной</div>
                  )}
                </div>
                <button
                  onClick={() => toggleDay(i)}
                  className={`w-9 h-5 rounded-full transition-all relative ${day.on ? 'bg-accent' : 'bg-slate-200'}`}
                >
                  <div className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-all ${day.on ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Blocking & Slots */}
        <section className="space-y-10">
          <div>
            <div className="flex items-center gap-4 mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Блокировка</h2>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-t3 uppercase mb-1.5 block">Дата</label>
                  <input
                    type="date"
                    value={newBlock.date}
                    onChange={e => setNewBlock({...newBlock, date: e.target.value})}
                    className="w-full input-modern"
                  />
                </div>
                {!newBlock.allDay && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-t3 uppercase mb-1.5 block">Начало</label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={e => setNewBlock({...newBlock, startTime: e.target.value})}
                        className="w-full input-modern"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-t3 uppercase mb-1.5 block">Конец</label>
                      <input
                        type="time"
                        value={newBlock.endTime}
                        onChange={e => setNewBlock({...newBlock, endTime: e.target.value})}
                        className="w-full input-modern"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newBlock.allDay}
                  onChange={e => setNewBlock({...newBlock, allDay: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-200 text-accent focus:ring-accent/20"
                />
                <label htmlFor="allDay" className="text-[13px] text-t2 font-medium">Весь день</label>
              </div>
              <button
                onClick={handleAddBlock}
                className="w-full py-2.5 text-accent text-[13px] font-bold border-2 border-accent/10 rounded-xl hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
              >
                <IconPlus size={16} stroke={2.5} /> Добавить блокировку
              </button>
            </div>
          </div>

          {/* List of blocked slots */}
          {blocks.length > 0 && (
            <div>
               <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-3">Заблокировано ({blocks.length})</div>
               <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {blocks.map((block) => (
                  <div key={block.id} className="group flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                    <IconBan size={14} className="text-t3" stroke={1.5} />
                    <div className="flex-1 text-[13px] font-medium text-t2">{formatBlock(block)}</div>
                    <button
                        onClick={() => removeBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-t3 hover:text-red-custom transition-all"
                    >
                        <IconX size={14} stroke={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Weekly Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Сетка недели</h2>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            <div className="text-[12px] font-bold text-t2 ml-6 bg-white px-3 py-1 rounded-full border border-slate-100">{weekRangeLabel}</div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
             <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-slate-100">
                {weekGrid.map((day, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveDayIndex(i)}
                        className={`flex-1 py-2 rounded-lg flex flex-col items-center transition-all ${
                        activeDayIndex === i ? 'bg-accent text-white' : 'text-t3'
                        }`}
                    >
                        <span className="text-[9px] font-bold uppercase">{day.day}</span>
                        <span className="text-[13px] font-extrabold">{day.dateLabel}</span>
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
                {weekGrid[activeDayIndex].slots.map((slot, si) => (
                <div
                    key={si}
                    className={`text-[11px] p-3 rounded-xl text-center font-bold border transition-all ${
                    slot.s === 'booked' ? 'bg-blue-50 text-blue-custom border-blue-100' :
                    slot.s === 'free' ? 'bg-green-50 text-green-custom border-green-100' :
                    'bg-slate-50 text-t3 border-slate-100'
                    }`}
                >
                    {slot.t}
                </div>
                ))}
            </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-7 gap-4">
          {weekGrid.map((day, i) => (
            <div key={i} className="flex flex-col">
              <div className={`text-center py-3 mb-4 rounded-xl transition-all ${day.today ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-t2 bg-white/50'}`}>
                <div className="text-[10px] font-bold uppercase opacity-70 tracking-widest">{day.day}</div>
                <div className="text-[18px] font-extrabold">{day.dateLabel}</div>
              </div>
              <div className="space-y-1.5">
                {day.slots.map((slot, si) => (
                  <div
                    key={si}
                    title={slot.t}
                    className={`h-7 rounded-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-95 select-none relative group/slot flex items-center overflow-hidden border ${
                      slot.s === 'booked' ? 'bg-blue-50/50 border-blue-100' :
                      slot.s === 'free' ? 'bg-green-50/50 border-green-100' :
                      'bg-slate-50 border-slate-100'
                    }`}
                  >
                    {/* Status Indicator Bar */}
                    <div className={`w-1 h-full shrink-0 ${
                         slot.s === 'booked' ? 'bg-blue-custom' :
                         slot.s === 'free' ? 'bg-green-custom' :
                         'bg-slate-200'
                    }`}></div>

                    <div className="px-2 text-[10px] font-bold text-t2 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                        {slot.t}
                    </div>

                    {slot.s === 'booked' && (
                        <div className="absolute right-2 text-blue-custom opacity-40 group-hover/slot:opacity-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-100">
            {[
                { label: 'Занято', color: 'bg-blue-custom' },
                { label: 'Свободно', color: 'bg-green-custom' },
                { label: 'Заблокировано', color: 'bg-slate-200' },
            ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[11px] font-bold text-t3 uppercase tracking-wider">
                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                    {item.label}
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
