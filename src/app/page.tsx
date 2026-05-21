'use client';

import React from 'react';
import {
  IconCalendarCheck,
  IconUsers,
  IconClockHour4,
  IconCurrencyRubel,
  IconClock,
  IconCalendar,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function Dashboard() {
  const { sessions, requests, approveRequest, rejectRequest } = useStore();

  // Dynamic stats
  const activeClients = new Set(sessions.map(s => s.name)).size + new Set(requests.map(r => r.name)).size;
  const pendingCount = requests.length;

  return (
    <div className="animate-fade-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#6366F1] via-[#818CF8] to-[#A5B4FC] rounded-r-xl p-[28px_32px] flex items-center justify-between mb-[22px] relative overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.28)]">
        <div className="relative z-10">
          <div className="text-[22px] font-bold text-white tracking-[-0.4px]">Добрый день, Алексей 👋</div>
          <div className="text-[13px] text-white/75 mt-[5px]">Сегодня у вас {sessions.filter(s => s.date === '2025-05-21').length} тренировки. Отличного рабочего дня!</div>
        </div>
        <div className="text-right relative z-10">
          <div className="text-[12px] text-white/65 mb-[3px]">Среда, 21 мая</div>
          <div className="text-[30px] font-extrabold text-white tracking-[-1px] leading-none">
            {sessions.filter(s => s.date === '2025-05-21').length} <small className="text-[12px] font-normal opacity-70 block mt-[2px]">тренировки сегодня</small>
          </div>
        </div>
        <div className="absolute w-[220px] h-[220px] bg-white/5 rounded-full -top-[70px] right-[100px] pointer-events-none"></div>
        <div className="absolute w-[120px] h-[120px] bg-white/5 rounded-full top-[30px] right-[70px] pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[22px]">
        {[
          { icon: <IconCalendarCheck size={18} />, val: '47', lbl: 'Сессий в мае', trend: '↑ 12% vs прошлый месяц', color: 'purple' },
          { icon: <IconUsers size={18} />, val: activeClients, lbl: 'Активных клиентов', trend: '↑ 2 новых на этой неделе', color: 'green' },
          { icon: <IconClockHour4 size={18} />, val: pendingCount, lbl: 'Ждут подтверждения', trend: pendingCount > 0 ? 'Требует внимания' : 'Все обработано', color: 'yellow', warn: pendingCount > 0 },
          { icon: <IconCurrencyRubel size={18} />, val: '84к', lbl: 'Доход в мае', trend: '↑ 8% vs апрель', color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className={`card relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:rounded-[3px_3px_0_0] ${
            stat.color === 'purple' ? 'before:bg-gradient-to-r before:from-[#6366F1] before:to-[#818CF8]' :
            stat.color === 'green' ? 'before:bg-gradient-to-r before:from-[#10B981] before:to-[#34D399]' :
            stat.color === 'yellow' ? 'before:bg-gradient-to-r before:from-[#F59E0B] before:to-[#FCD34D]' :
            'before:bg-gradient-to-r before:from-[#3B82F6] before:to-[#60A5FA]'
          } hover:shadow-sh-md hover:-translate-y-[2px] transition-all cursor-default`}>
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center mb-3 ${
              stat.color === 'purple' ? 'bg-accent-light text-accent' :
              stat.color === 'green' ? 'bg-green-light text-green-custom' :
              stat.color === 'yellow' ? 'bg-yellow-light text-yellow-custom' :
              'bg-blue-light text-blue-custom'
            }`}>
              {stat.icon}
            </div>
            <div className="text-[28px] font-bold text-t1 tracking-[-1.2px] leading-none mb-[3px]">{stat.val}</div>
            <div className="text-[12px] text-t3">{stat.lbl}</div>
            <div className={`text-[11px] font-medium mt-2 ${stat.warn ? 'text-yellow-custom' : 'text-green-custom'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[14px] font-semibold text-t1">Сегодня</div>
              <div className="text-[12px] text-t3 mt-[2px]">21 мая — ваше расписание</div>
            </div>
          </div>
          {sessions.filter(s => s.date === '2025-05-21').length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">На сегодня нет записей</div>
          )}
          {sessions.filter(s => s.date === '2025-05-21').map((session, i) => (
            <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[11.5px] font-bold shrink-0" style={{ backgroundColor: session.bg, color: session.color }}>
                {session.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-t1">{session.name}</div>
                <div className="text-[12px] text-t3 mt-[2px] flex items-center gap-1">
                  <IconClock size={11} /> {session.time}
                </div>
              </div>
              <span className="text-[11px] font-semibold px-[10px] py-1 rounded-full bg-green-light text-green-custom">Подтверждено</span>
            </div>
          ))}
        </div>

        {/* New Requests */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[14px] font-semibold text-t1">Новые заявки</div>
              <div className="text-[12px] text-t3 mt-[2px]">Ожидают вашего ответа</div>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-custom text-white text-[11px] font-semibold rounded-full px-[9px] py-[3px]">{pendingCount}</span>
            )}
          </div>
          {requests.length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">Новых заявок нет</div>
          )}
          {requests.map((req, i) => (
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
              <div className="flex gap-[7px] shrink-0">
                <button
                  onClick={() => approveRequest(req.id)}
                  className="bg-green-light text-green-custom border border-green-custom/20 text-[12px] font-medium p-1.5 rounded-r-sm hover:bg-green-custom hover:text-white transition-all"
                >
                  <IconCheck size={14} />
                </button>
                <button
                  onClick={() => rejectRequest(req.id)}
                  className="bg-red-light text-red-custom border border-red-custom/20 text-[12px] font-medium p-1.5 rounded-r-sm hover:bg-red-custom hover:text-white transition-all"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="text-[14px] font-semibold text-t1">Последние события</div>
          </div>
          {[
            { dot: 'bg-green-custom', text: 'Дмитрий Макаров записался на 21 мая', time: '5 мин' },
            { dot: 'bg-accent', text: 'Анна Иванова подтвердила запись', time: '1 ч' },
            { dot: 'bg-yellow-custom', text: 'Павел Волков оставил заявку', time: '2 ч' },
            { dot: 'bg-red-custom', text: 'Сергей Лобанов отменил запись', time: '5 ч' },
            { dot: 'bg-green-custom', text: 'Ольга Кириллова подключилась к боту', time: 'Вчера' },
          ].map((act, i) => (
            <div key={i} className="flex items-center gap-2.5 py-[10px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${act.dot}`}></div>
              <div className="text-[13px] text-t2 flex-1 leading-[1.45]">{act.text}</div>
              <div className="text-[11px] text-t3 whitespace-nowrap">{act.time}</div>
            </div>
          ))}
        </div>

        {/* Load Chart */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="text-[14px] font-semibold text-t1">Загруженность недели</div>
          </div>
          <div className="flex flex-col gap-[9px]">
            {[
              { day: 'Понедельник', val: '5/6', perc: 83, color: 'bg-gradient-to-r from-accent to-accent-mid' },
              { day: 'Вторник', val: '4/6', perc: 67, color: 'bg-gradient-to-r from-accent to-accent-mid' },
              { day: 'Среда', val: '4/5', perc: 80, color: 'bg-gradient-to-r from-green-custom to-[#34D399]', today: true },
              { day: 'Четверг', val: '3/6', perc: 50, color: 'bg-gradient-to-r from-accent to-accent-mid' },
              { day: 'Пятница', val: '5/5', perc: 100, color: 'bg-gradient-to-r from-yellow-custom to-[#FCD34D]' },
              { day: 'Суббота', val: '2/3', perc: 67, color: 'bg-gradient-to-r from-accent to-accent-mid' },
            ].map((row, i) => (
              <div key={i} className="prog-item">
                <div className="flex justify-between mb-[5px]">
                  <span className="text-[12px] text-t2">
                    {row.day} {row.today && <span className="text-accent text-[10px]">● сегодня</span>}
                  </span>
                  <span className="text-[12px] font-medium text-t1">{row.val}</span>
                </div>
                <div className="h-1.5 bg-bg-custom rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${row.color}`} style={{ width: `${row.perc}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
