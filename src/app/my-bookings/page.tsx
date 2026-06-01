'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconClock, IconCalendar } from '@tabler/icons-react';

export default function MyBookings() {
  const { sessions, requests } = useStore();

  const recommendations = sessions.slice(0, 1); // Mock: reuse previous masters

  return (
    <div className="animate-fade-up max-w-[800px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Мои записи</h1>

      <section className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm">
        <h2 className="text-sm font-bold text-t1 uppercase tracking-wider mb-4">Предстоящие тренировки</h2>
        <div className="space-y-3">
          {sessions.length === 0 && (
            <div className="py-8 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                У вас нет подтвержденных записей
            </div>
          )}
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-custom border border-border-light">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                {session.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-t1">{session.name}</div>
                <div className="text-[13px] text-t2">{session.service}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[12px] text-t3 flex items-center gap-1">
                    <IconCalendar size={14} /> {session.date}
                  </span>
                  <span className="text-[12px] text-t3 flex items-center gap-1">
                    <IconClock size={14} /> {session.time}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-green-custom bg-green-custom/10 px-2 py-1 rounded-full">
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

      <section className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm">
        <h2 className="text-sm font-bold text-t1 uppercase tracking-wider mb-4">Заявки на рассмотрении</h2>
        <div className="space-y-3">
          {requests.length === 0 && (
            <div className="py-8 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                У вас нет активных заявок
            </div>
          )}
          {requests.map((req) => (
            <div key={req.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-custom border border-border-light opacity-75">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                {req.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-t1">{req.name}</div>
                <div className="text-[13px] text-t2">{req.service}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[12px] text-t3 flex items-center gap-1">
                    <IconCalendar size={14} /> {req.date}
                  </span>
                  <span className="text-[12px] text-t3 flex items-center gap-1">
                    <IconClock size={14} /> {req.time}
                  </span>
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
  );
}
