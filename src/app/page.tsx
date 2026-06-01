'use client';

import React, { useMemo } from 'react';
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
  const { sessions, requests, approveRequest, rejectRequest, profile, events } = useStore();
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);

  const handleReject = (id: string, reschedule: boolean) => {
    rejectRequest(id, reschedule);
    setRejectingId(null);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  const todaySessions = useMemo(() => {
    return sessions.filter(s => s.date === todayStr);
  }, [sessions, todayStr]);

  // Dynamic stats
  const activeClients = new Set([...sessions.map(s => s.name), ...requests.map(r => r.name)]).size;
  const pendingCount = requests.length;

  return (
    <div className="animate-fade-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#6366F1] via-[#818CF8] to-[#A5B4FC] rounded-r-xl p-[28px_32px] flex items-center justify-between mb-[22px] relative overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.28)]">
        <div className="relative z-10">
          <div className="text-[22px] font-bold text-white tracking-[-0.4px]">Добрый день, {profile?.full_name?.split(' ')[0] || 'Тренер'} 👋</div>
          <div className="text-[13px] text-white/75 mt-[5px]">
            {todaySessions.length > 0
                ? `Сегодня у вас ${todaySessions.length} тренировки. Отличного рабочего дня!`
                : 'На сегодня тренировок пока нет. Самое время запланировать новые!'}
          </div>
        </div>
        <div className="text-right relative z-10">
          <div className="text-[12px] text-white/65 mb-[3px] capitalize">{todayLabel}</div>
          <div className="text-[30px] font-extrabold text-white tracking-[-1px] leading-none">
            {todaySessions.length} <small className="text-[12px] font-normal opacity-70 block mt-[2px]">тренировки сегодня</small>
          </div>
        </div>
        <div className="absolute w-[220px] h-[220px] bg-white/5 rounded-full -top-[70px] right-[100px] pointer-events-none"></div>
        <div className="absolute w-[120px] h-[120px] bg-white/5 rounded-full top-[30px] right-[70px] pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[22px]">
        {[
          { icon: <IconCalendarCheck size={18} />, val: sessions.length, lbl: 'Сессии', lblFull: 'Подтвержденных сессий', trend: 'Всё по графику', color: 'purple' },
          { icon: <IconUsers size={18} />, val: activeClients, lbl: 'Клиенты', lblFull: 'Активных клиентов', trend: 'База растет', color: 'green' },
          { icon: <IconClockHour4 size={18} />, val: pendingCount, lbl: 'Заявки', lblFull: 'Ждут подтверждения', trend: pendingCount > 0 ? 'Внимание' : 'Ок', color: 'yellow', warn: pendingCount > 0 },
          { icon: <IconCurrencyRubel size={18} />, val: (sessions.length * 2500).toLocaleString('ru-RU') + ' ₽', lbl: 'Доход', lblFull: 'Прогноз дохода', trend: 'Прогноз', color: 'blue' },
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
            <div className="text-[22px] sm:text-[28px] font-bold text-t1 tracking-[-1.2px] leading-none mb-[3px]">{stat.val}</div>
            <div className="text-[11px] sm:text-[12px] text-t3 truncate">
              <span className="hidden sm:inline">{stat.lblFull}</span>
              <span className="sm:hidden">{stat.lbl}</span>
            </div>
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
              <div className="text-[12px] text-t3 mt-[2px] capitalize">{todayLabel} — ваше расписание</div>
            </div>
          </div>
          {todaySessions.length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">На сегодня нет записей</div>
          )}
          {todaySessions.map((session, i) => (
            <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
              <div className="w-[38px] h-[38px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[11.5px] font-bold shrink-0">
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
                  <IconCalendar size={11} /> {req.date} · {req.time}
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
                  onClick={() => setRejectingId(req.id)}
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
          {events.length === 0 && (
            <div className="text-center py-8 text-t3 text-[13px]">Событий пока нет</div>
          )}
          {events.map((act, i) => {
            const date = new Date(act.created_at);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            const diffHr = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHr / 24);

            let timeStr = 'Только что';
            if (diffDay > 0) timeStr = `${diffDay} д`;
            else if (diffHr > 0) timeStr = `${diffHr} ч`;
            else if (diffMin > 0) timeStr = `${diffMin} мин`;

            const dotColor =
              act.type === 'booking' ? 'bg-green-custom' :
              act.type === 'system' ? 'bg-accent' :
              act.type === 'message' ? 'bg-blue-custom' : 'bg-yellow-custom';

            return (
              <div key={i} className="flex items-center gap-2.5 py-[10px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}></div>
                <div className="text-[13px] text-t2 flex-1 leading-[1.45]">{act.message}</div>
                <div className="text-[11px] text-t3 whitespace-nowrap">{timeStr}</div>
              </div>
            );
          })}
        </div>

        {/* Performance Hint */}
        <div className="card bg-accent text-white border-none shadow-lg shadow-accent/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <IconCalendarCheck size={20} />
            </div>
            <div>
              <div className="text-[15px] font-bold">Совет по продуктивности</div>
              <div className="text-[12px] opacity-90 mt-1 leading-[1.5]">
                Заполните заблокированные часы в расписании на следующую неделю, чтобы клиенты не могли записаться в ваше личное время.
              </div>
              <button className="mt-3 bg-white text-accent text-[11px] font-bold px-3 py-1.5 rounded-r-sm hover:bg-opacity-90 transition-all">
                Перейти к расписанию
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
                <div className="text-[16px] font-bold text-t1 mb-2">Отклонить заявку?</div>
                <p className="text-[13px] text-t3 mb-6">Вы можете просто отклонить запись или предложить клиенту выбрать другое время в боте.</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => handleReject(rejectingId, true)}
                        className="w-full bg-accent text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all"
                    >
                        Предложить перенос
                    </button>
                    <button
                        onClick={() => handleReject(rejectingId, false)}
                        className="w-full bg-red-custom text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-600 transition-all"
                    >
                        Отклонить без переноса
                    </button>
                    <button
                        onClick={() => setRejectingId(null)}
                        className="w-full bg-bg-custom text-t2 py-2.5 rounded-xl text-[13px] font-bold hover:bg-border-light transition-all"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
