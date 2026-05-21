import React from 'react';
import { IconCalendar, IconCheck, IconX } from '@tabler/icons-react';

export default function RequestsPage() {
  return (
    <div className="animate-fade-up">
      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Ожидают подтверждения</div>
      <div className="card mb-4">
        {[
          { name: 'Наталья Соколова', time: 'Четверг 22 мая · 10:00–11:00', initials: 'НС' },
          { name: 'Павел Волков', time: 'Пятница 23 мая · 17:00–18:00', initials: 'ПВ' },
          { name: 'Ольга Кириллова', time: 'Суббота 24 мая · 11:00–12:00', initials: 'ОК' },
        ].map((req, i) => (
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
              <button className="bg-green-light text-green-custom border border-green-custom/20 text-[12px] font-medium px-3 py-1.5 rounded-r-sm hover:bg-green-custom hover:text-white transition-all">Принять</button>
              <button className="bg-red-light text-red-custom border border-red-custom/20 text-[12px] font-medium px-3 py-1.5 rounded-r-sm hover:bg-red-custom hover:text-white transition-all">Отклонить</button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Обработанные</div>
      <div className="card">
        <div className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
          <div className="w-[38px] h-[38px] rounded-full bg-blue-light text-blue-custom flex items-center justify-center text-[11.5px] font-bold shrink-0">ДМ</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium text-t1">Дмитрий Макаров</div>
            <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
              <IconCalendar size={11} /> 21 мая · 12:00–13:00
            </div>
          </div>
          <span className="text-[11px] font-semibold px-[10px] py-1 rounded-full bg-green-light text-green-custom">принято</span>
        </div>
        <div className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
          <div className="w-[38px] h-[38px] rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center text-[11.5px] font-bold shrink-0">СЛ</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium text-t1">Сергей Лобанов</div>
            <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
              <IconCalendar size={11} /> 20 мая · 15:00–16:00
            </div>
          </div>
          <span className="text-[11px] font-semibold px-[10px] py-1 rounded-full bg-red-light text-red-custom">отклонено</span>
        </div>
      </div>
    </div>
  );
}
