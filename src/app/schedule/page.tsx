'use client';

import React, { useState, useMemo } from 'react';
import { IconBan, IconX, IconPlus } from '@tabler/icons-react';
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
    const slotDuration = profile?.slot_duration || 60;

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
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const rangeLabel = `${monday.toLocaleDateString('ru-RU', { day: 'numeric' })}–${lastDate.toLocaleDateString('ru-RU', options)}`;

    return { weekGrid: grid, weekRangeLabel: rangeLabel };
  }, [schedule, sessions, blocks, profile]);

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Рабочие дни и часы</div>
          <div className="card">
            {schedule.map((day, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border-light last:border-none gap-3 sm:gap-0">
                <div className="flex-1 flex items-center justify-between sm:block">
                  <div className="text-[13.5px] font-medium text-t1">{day.name}</div>
                  <div
                    onClick={() => toggleDay(i)}
                    className={`sm:hidden w-10 h-[22px] rounded-full cursor-pointer transition-all relative shrink-0 ${day.on ? 'bg-green-custom' : 'bg-border-custom'}`}
                  >
                    <div className={`absolute w-4 h-4 bg-white rounded-full top-[3px] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.15)] ${day.on ? 'left-[21px]' : 'left-[3px]'}`}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {day.on ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateScheduleTime(i, e.target.value, day.endTime)}
                        className="text-[12px] text-t2 bg-bg-custom border border-border-light rounded px-1.5 py-0.5 outline-none focus:border-accent"
                      />
                      <span className="text-t3">–</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateScheduleTime(i, day.startTime, e.target.value)}
                        className="text-[12px] text-t2 bg-bg-custom border border-border-light rounded px-1.5 py-0.5 outline-none focus:border-accent"
                      />
                    </div>
                  ) : (
                    <div className="text-[12px] text-t3 mt-[1px]">Выходной</div>
                  )}
                </div>
                <div
                  onClick={() => toggleDay(i)}
                  className={`hidden sm:block w-10 h-[22px] rounded-full cursor-pointer transition-all relative shrink-0 ${day.on ? 'bg-green-custom' : 'bg-border-custom'}`}
                >
                  <div className={`absolute w-4 h-4 bg-white rounded-full top-[3px] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.15)] ${day.on ? 'left-[21px]' : 'left-[3px]'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Заблокировать время</div>
            <div className="card">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 mb-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-t3 block mb-1">Дата</label>
                  <input
                    type="date"
                    value={newBlock.date}
                    onChange={e => setNewBlock({...newBlock, date: e.target.value})}
                    className="w-full text-[13px] border border-border-custom rounded-r-sm p-[8px_12px] bg-surface text-t1 outline-none focus:border-accent"
                  />
                </div>
                {!newBlock.allDay && (
                  <>
                    <div className="flex-1">
                      <label className="text-[11px] text-t3 block mb-1">Начало</label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={e => setNewBlock({...newBlock, startTime: e.target.value})}
                        className="w-full text-[13px] border border-border-custom rounded-r-sm p-[8px_12px] bg-surface text-t1 outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-t3 block mb-1">Конец</label>
                      <input
                        type="time"
                        value={newBlock.endTime}
                        onChange={e => setNewBlock({...newBlock, endTime: e.target.value})}
                        className="w-full text-[13px] border border-border-custom rounded-r-sm p-[8px_12px] bg-surface text-t1 outline-none focus:border-accent"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newBlock.allDay}
                  onChange={e => setNewBlock({...newBlock, allDay: e.target.checked})}
                  className="rounded border-border-custom text-accent focus:ring-accent"
                />
                <label htmlFor="allDay" className="text-[13px] text-t2">Весь день</label>
              </div>
              <button
                onClick={handleAddBlock}
                className="w-full bg-accent text-white text-[13px] font-semibold py-2.5 rounded-r-sm transition-all hover:bg-accent-hover flex items-center justify-center gap-2"
              >
                <IconPlus size={16} /> Добавить блокировку
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Заблокированные слоты</div>
            <div className="card">
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {blocks.length === 0 && (
                  <div className="text-center py-4 text-t3 text-[13px]">Нет заблокированных слотов</div>
                )}
                {blocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-[9px] p-[10px_12px] bg-bg-custom rounded-r-sm border border-border-light">
                    <IconBan size={14} className="text-t3" />
                    <div className="flex-1 text-[13px] text-t2">{formatBlock(block)}</div>
                    <IconX
                      size={15}
                      className="text-t3 cursor-pointer hover:text-red-custom transition-all"
                      onClick={() => removeBlock(block.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Обзор недели · {weekRangeLabel}</div>

      {/* Mobile Weekly Overview Selector */}
      <div className="flex sm:hidden items-center justify-between bg-white border border-border-light rounded-xl p-1 mb-3">
        {weekGrid.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDayIndex(i)}
            className={`flex-1 py-2 rounded-lg flex flex-col items-center transition-all ${
              activeDayIndex === i ? 'bg-accent text-white shadow-md' : 'text-t3'
            }`}
          >
            <span className="text-[9px] font-bold uppercase">{day.day}</span>
            <span className="text-[13px] font-extrabold">{day.dateLabel}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-7 gap-1.5 min-w-[600px]">
          {weekGrid.map((day, i) => (
            <div key={i} className="text-center">
              <div className={`text-[10px] font-semibold mb-[2px] uppercase tracking-[0.05em] ${day.today ? 'text-accent' : 'text-t3'}`}>
                {day.day}
              </div>
              <div className={`text-[14px] font-bold mb-[7px] ${day.today ? 'text-accent' : 'text-t1'}`}>
                {day.dateLabel}
              </div>
              {day.slots.map((slot, si) => (
                <div
                  key={si}
                  className={`text-[10px] p-[4px_2px] rounded-[5px] mb-[3px] cursor-pointer transition-all hover:opacity-70 select-none ${
                    slot.s === 'booked' ? 'bg-blue-light text-blue-custom border border-blue-custom/10' :
                    slot.s === 'free' ? 'bg-green-light text-green-custom border border-green-custom/10' :
                    'bg-bg-custom text-t3 border border-border-light'
                  }`}
                >
                  {slot.t}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile Single Day View */}
        <div className="sm:hidden">
          <div className="text-center mb-4">
            <div className="text-[12px] font-bold text-accent uppercase tracking-wider mb-1">
              {weekGrid[activeDayIndex].dayName}
            </div>
            <div className="text-[20px] font-extrabold text-t1">
              {weekGrid[activeDayIndex].dateLabel}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {weekGrid[activeDayIndex].slots.map((slot, si) => (
              <div
                key={si}
                className={`text-[11px] p-3 rounded-xl text-center font-bold border transition-all ${
                  slot.s === 'booked' ? 'bg-blue-light text-blue-custom border-blue-custom/20' :
                  slot.s === 'free' ? 'bg-green-light text-green-custom border-green-custom/20' :
                  'bg-bg-custom text-t3 border-border-light'
                }`}
              >
                {slot.t}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-2 border-t border-border-light">
          <div className="flex items-center gap-[5px] text-[11px] text-t3">
            <div className="w-[10px] h-[10px] rounded-[3px] bg-blue-light border border-blue-custom/20"></div>занято
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-t3">
            <div className="w-[10px] h-[10px] rounded-[3px] bg-green-light border border-green-custom/20"></div>свободно
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-t3">
            <div className="w-[10px] h-[10px] rounded-[3px] bg-bg-custom border border-border-custom"></div>заблокировано
          </div>
        </div>
      </div>
    </div>
  );
}
