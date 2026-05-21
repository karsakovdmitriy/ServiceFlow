'use client';

import React, { useState } from 'react';
import { IconBan, IconX, IconPlus } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function SchedulePage() {
  const { schedule, blocks, toggleDay, updateScheduleTime, addBlock, removeBlock } = useStore();
  const [newBlock, setNewBlock] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    allDay: false
  });

  const gridData = [
    { day: 'ПН', slots: [{ t: '09:00', s: 'booked' }, { t: '10:00', s: 'booked' }, { t: '11:00', s: 'free' }, { t: '12:00', s: 'booked' }, { t: '13:00', s: 'free' }, { t: '15:00', s: 'booked' }] },
    { day: 'ВТ', slots: [{ t: '09:00', s: 'free' }, { t: '10:00', s: 'booked' }, { t: '11:00', s: 'booked' }, { t: '14:00', s: 'free' }, { t: '17:00', s: 'booked' }] },
    { day: 'СР', slots: [{ t: '09:00', s: 'booked' }, { t: '10:00', s: 'free' }, { t: '12:00', s: 'booked' }, { t: '15:00', s: 'booked' }, { t: '16:00', s: 'free' }, { t: '18:00', s: 'booked' }], today: true },
    { day: 'ЧТ', slots: [{ t: '10:00', s: 'free' }, { t: '12:00', s: 'booked' }, { t: '14:00', s: 'free' }, { t: '16:00', s: 'booked' }] },
    { day: 'ПТ', slots: [{ t: '09:00', s: 'booked' }, { t: '10:00', s: 'booked' }, { t: '11:00', s: 'booked' }, { t: '13:00', s: 'booked' }, { t: '17:00', s: 'booked' }] },
    { day: 'СБ', slots: [{ t: '10:00', s: 'free' }, { t: '14:00', s: 'blocked' }, { t: '15:00', s: 'blocked' }] },
    { day: 'ВС', slots: [{ t: '—', s: 'blocked' }] },
  ];

  const handleAddBlock = () => {
    addBlock(newBlock);
  };

  const formatBlock = (block: any) => {
    const d = new Date(block.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    return block.allDay ? `${d} · весь день` : `${d} · ${block.startTime}–${block.endTime}`;
  };

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Рабочие дни и часы</div>
          <div className="card">
            {schedule.map((day, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border-light last:border-none">
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium text-t1">{day.name}</div>
                  {day.on ? (
                    <div className="flex items-center gap-2 mt-1">
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
                  className={`w-10 h-[22px] rounded-full cursor-pointer transition-all relative shrink-0 ${day.on ? 'bg-green-custom' : 'bg-border-custom'}`}
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
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
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
                    <div>
                      <label className="text-[11px] text-t3 block mb-1">Начало</label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={e => setNewBlock({...newBlock, startTime: e.target.value})}
                        className="w-full text-[13px] border border-border-custom rounded-r-sm p-[8px_12px] bg-surface text-t1 outline-none focus:border-accent"
                      />
                    </div>
                    <div>
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
              <div className="flex flex-col gap-2">
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

      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Обзор недели · 19–25 мая</div>
      <div className="card overflow-x-auto">
        <div className="grid grid-cols-7 gap-1.5 min-w-[600px]">
          {gridData.map((day, i) => (
            <div key={i} className="text-center">
              <div className={`text-[10px] font-semibold mb-[7px] uppercase tracking-[0.05em] ${day.today ? 'text-accent' : 'text-t3'}`}>
                {day.day} {day.today && '●'}
              </div>
              {day.slots.map((slot, si) => (
                <div
                  key={si}
                  className={`text-[10px] p-[4px_2px] rounded-[5px] mb-[3px] cursor-pointer transition-all hover:opacity-70 select-none ${
                    slot.s === 'booked' ? 'bg-[#DBEAFE] text-[#1D4ED8]' :
                    slot.s === 'free' ? 'bg-[#DCFCE7] text-[#15803D]' :
                    'bg-bg-custom text-t3 border border-border-light'
                  }`}
                >
                  {slot.t}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex gap-[14px] mt-3.5">
          <div className="flex items-center gap-[5px] text-[11px] text-t3">
            <div className="w-[10px] h-[10px] rounded-[3px] bg-[#DBEAFE]"></div>занято
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-t3">
            <div className="w-[10px] h-[10px] rounded-[3px] bg-[#DCFCE7]"></div>свободно
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-t3">
            <div className="w-[10px] h-[10px] rounded-[3px] bg-bg-custom border border-border-custom"></div>заблокировано
          </div>
        </div>
      </div>
    </div>
  );
}
