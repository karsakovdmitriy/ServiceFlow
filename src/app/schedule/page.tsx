'use client';

import React, { useState, useMemo } from 'react';
import { IconBan, IconX, IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useStore, Session, BlockedSlot, ScheduleDay } from '@/lib/store';

const DAYS_RU_SHORT = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const DAYS_RU_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export default function SchedulePage() {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);

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
  const { weekGrid, weekRangeLabel, currentWeekMonday, currentWeekSunday } = useMemo(() => {
    const curr = new Date();
    curr.setDate(curr.getDate() + (weekOffset * 7));
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
    const sunday = new Date(lastDate);
    sunday.setHours(23,59,59,999);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const rangeLabel = `${monday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${lastDate.toLocaleDateString('ru-RU', options)}`;

    return {
        weekGrid: grid,
        weekRangeLabel: rangeLabel,
        currentWeekMonday: monday,
        currentWeekSunday: sunday
    };
  }, [schedule, sessions, blocks, weekOffset]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => {
        const d = new Date(b.date);
        return d >= currentWeekMonday && d <= currentWeekSunday;
    });
  }, [blocks, currentWeekMonday, currentWeekSunday]);

  return (
    <div className="animate-fade-up max-w-[1200px] mx-auto space-y-16">

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Working Hours */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest whitespace-nowrap">Рабочие часы</h2>
          </div>
          <div className="space-y-2">
            {schedule.map((day, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border-light last:border-0 px-4 -mx-4 rounded-xl hover:bg-bg-custom/50 transition-all group">
                <div className="text-[14px] font-bold text-t1 w-24 tracking-tight">{day.name}</div>
                <div className="flex-1 flex items-center gap-4">
                  {day.on ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateScheduleTime(i, e.target.value, day.endTime)}
                        className="text-[13px] font-bold text-t2 bg-transparent border-none p-0 outline-none focus:text-accent transition-colors"
                      />
                      <span className="text-t3 opacity-30">—</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateScheduleTime(i, day.startTime, e.target.value)}
                        className="text-[13px] font-bold text-t2 bg-transparent border-none p-0 outline-none focus:text-accent transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="text-[12px] text-t3 font-medium opacity-50 italic">Выходной</div>
                  )}
                </div>
                <button
                  onClick={() => toggleDay(i)}
                  className={`w-8 h-4 rounded-full transition-all relative ${day.on ? 'bg-accent' : 'bg-slate-200'}`}
                >
                  <div className={`absolute w-2.5 h-2.5 bg-white rounded-full top-0.75 transition-all ${day.on ? 'left-4.5' : 'left-0.75'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Blocking & Slots */}
        <section className="space-y-12">
          <div>
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest whitespace-nowrap">Блокировка</h2>
            </div>
            <div className="p-0 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 block opacity-60">Дата</label>
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
                      <label className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 block opacity-60">Начало</label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={e => setNewBlock({...newBlock, startTime: e.target.value})}
                        className="w-full input-modern"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 block opacity-60">Конец</label>
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
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newBlock.allDay}
                  onChange={e => setNewBlock({...newBlock, allDay: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-200 text-accent focus:ring-0 transition-all"
                />
                <label htmlFor="allDay" className="text-[13px] text-t2 font-bold tracking-tight">Весь день</label>
              </div>
              <button
                onClick={handleAddBlock}
                className="text-accent text-[13px] font-bold hover:underline transition-all flex items-center gap-2"
              >
                <IconPlus size={16} stroke={2.5} /> Добавить блокировку
              </button>
            </div>
          </div>

          {/* List of blocked slots */}
          {filteredBlocks.length > 0 && (
            <div>
               <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-3">Заблокировано на эту неделю ({filteredBlocks.length})</div>
               <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {filteredBlocks.map((block) => (
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
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">Сетка недели</h2>
            <div className="flex items-center gap-4">
                <div className="flex bg-bg-custom p-1 rounded-xl">
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        className="p-1.5 hover:bg-surface rounded-lg text-t3 hover:text-t1 transition-all"
                    >
                        <IconChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setWeekOffset(0)}
                        className="px-3 text-[10px] font-bold uppercase text-t3 hover:text-accent transition-all"
                    >
                        СЕГОДНЯ
                    </button>
                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        className="p-1.5 hover:bg-surface rounded-lg text-t3 hover:text-t1 transition-all"
                    >
                        <IconChevronRight size={16} />
                    </button>
                </div>
                <div className="text-[12px] font-bold text-t1">{weekRangeLabel}</div>
            </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-6">
             <div className="flex items-center justify-between bg-surface p-1 rounded-2xl">
                {weekGrid.map((day, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveDayIndex(i)}
                        className={`flex-1 py-3 rounded-xl flex flex-col items-center transition-all ${
                        activeDayIndex === i ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-t3'
                        }`}
                    >
                        <span className="text-[9px] font-bold uppercase tracking-widest mb-1">{day.day}</span>
                        <span className="text-[15px] font-extrabold">{day.dateLabel}</span>
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
                {weekGrid[activeDayIndex].slots.map((slot, si) => (
                <div
                    key={si}
                    className={`text-[12px] p-4 rounded-2xl text-center font-bold transition-all ${
                    slot.s === 'booked' ? 'bg-blue-50/50 text-blue-custom' :
                    slot.s === 'free' ? 'bg-green-50/50 text-green-custom' :
                    'bg-slate-50 text-t3 opacity-40'
                    }`}
                >
                    {slot.t}
                </div>
                ))}
            </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-7 gap-6">
          {weekGrid.map((day, i) => (
            <div key={i} className="flex flex-col">
              <div className={`text-center py-4 mb-6 rounded-2xl transition-all ${day.today ? 'bg-accent text-white' : 'text-t2 bg-surface'}`}>
                <div className="text-[9px] font-bold uppercase opacity-60 tracking-widest mb-1">{day.day}</div>
                <div className="text-[20px] font-extrabold tracking-tight">{day.dateLabel}</div>
              </div>
              <div className="space-y-2">
                {day.slots.map((slot, si) => (
                  <div
                    key={si}
                    title={slot.t}
                    className={`h-8 rounded-xl cursor-pointer transition-all hover:translate-x-1 active:scale-95 select-none relative group/slot flex items-center overflow-hidden ${
                      slot.s === 'booked' ? 'bg-blue-50/30' :
                      slot.s === 'free' ? 'bg-green-50/30' :
                      'bg-bg-custom/40 opacity-20'
                    }`}
                  >
                    {/* Status Indicator Bar */}
                    <div className={`w-1 h-full shrink-0 ${
                         slot.s === 'booked' ? 'bg-blue-custom/60' :
                         slot.s === 'free' ? 'bg-green-custom/60' :
                         'bg-slate-300'
                    }`}></div>

                    <div className="px-3 text-[10px] font-bold text-t2 tracking-tight">
                        {slot.t}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border-light">
            {[
                { label: 'Занято', color: 'bg-blue-custom/60' },
                { label: 'Свободно', color: 'bg-green-custom/60' },
                { label: 'Заблокировано', color: 'bg-slate-200' },
            ].map(item => (
                <div key={item.label} className="flex items-center gap-3 text-[10px] font-bold text-t3 uppercase tracking-widest">
                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                    {item.label}
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
