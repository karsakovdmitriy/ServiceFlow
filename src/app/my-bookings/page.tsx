'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconClock, IconCalendar } from '@tabler/icons-react';

export default function MyBookings() {
  const { sessions, requests, profile } = useStore();

  const recommendations = sessions.slice(0, 1); // Mock: reuse previous masters

  return (
    <div className="animate-fade-up max-w-[1100px] mx-auto space-y-12">
      {/* Metrics Section (Overview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
        {[
          { label: 'Мой профиль', val: profile?.full_name?.split(' ')[0] || '...', sub: 'Клиент' },
          { label: 'Записи', val: sessions.length, sub: 'Всего' },
          { label: 'Заявки', val: requests.length, sub: 'Ожидают', highlight: requests.length > 0 },
          { label: 'Партнеры', val: '0', sub: 'Активные' },
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Предстоящие тренировки</h2>
                <div className="h-px bg-border flex-1 mx-4"></div>
                <span className="text-[11px] font-bold text-t3">{sessions.length} записей</span>
            </div>
        <div className="space-y-1">
          {sessions.length === 0 && (
            <div className="py-10 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                У вас нет подтвержденных записей
            </div>
          )}
          {sessions.map((session, i) => (
            <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-bg-custom transition-all">
              <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-[11px] font-bold text-accent shrink-0 border border-surface">
                {session.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-t1">{session.name}</div>
                <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5">
                  <IconClock size={12} stroke={1.5} /> {session.date} · {session.time}
                </div>
              </div>
              <div className="flex items-center text-[11px] font-bold text-green-custom">
                <span className="status-dot bg-green-custom"></span>
                Подтверждено
              </div>
            </div>
          ))}
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border border-accent/20 shadow-sh-sm">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
            Рекомендации: Записаться повторно
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={`rec-${rec.id}`} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-accent/10 hover:border-accent transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold">
                    {rec.initials}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-t1">{rec.name}</div>
                    <div className="text-[12px] text-t3">{rec.service}</div>
                  </div>
                </div>
                <button className="bg-accent text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-accent-hover transition-all">
                  Записаться снова
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

          <section className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Заявки на рассмотрении</h2>
                <div className="h-px bg-border flex-1 mx-4"></div>
                {requests.length > 0 && (
                  <span className="text-[11px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-full">{requests.length} ожидают</span>
                )}
            </div>
            <div className="space-y-1">
              {requests.length === 0 && (
                <div className="py-10 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                    У вас нет активных заявок
                </div>
              )}
              {requests.map((req, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-bg-custom transition-all opacity-75">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 border border-surface">
                    {req.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-t1">{req.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5 flex items-center gap-1.5">
                      <IconClock size={12} stroke={1.5} /> {req.date} · {req.time}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-t3 bg-slate-100 px-2 py-1 rounded-full">
                    Ожидает
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          {recommendations.length > 0 && (
            <section className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border border-accent/20 shadow-sh-sm">
              <h2 className="text-[14px] font-bold text-accent uppercase tracking-wider mb-5">Рекомендации</h2>
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={`rec-${rec.id}`} className="p-4 rounded-xl bg-surface border border-accent/10 hover:border-accent transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold">
                        {rec.initials}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-t1">{rec.name}</div>
                        <div className="text-[12px] text-t3">{rec.service}</div>
                      </div>
                    </div>
                    <button className="w-full bg-accent text-white py-2 rounded-lg text-[12px] font-bold hover:bg-accent-hover transition-all">
                      Записаться снова
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="bg-surface p-6 rounded-r-xl border border-border-light shadow-sh-sm">
             <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider mb-5">Информация</h2>
             <p className="text-[12px] text-t2 leading-relaxed">
               В этом разделе вы можете видеть все ваши активные записи и статус новых заявок.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
